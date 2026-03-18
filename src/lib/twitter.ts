/**
 * X data fetcher using @steipete/bird CLI.
 *
 * Uses browser cookies (Chrome) to access X's internal GraphQL API.
 * No API key or bearer token needed.
 */

import { spawn } from "child_process";
import path from "path";
import { Tweet, MediaInfo } from "./algorithm";

// Resolve bird binary from node_modules
const BIRD_BIN = path.join(process.cwd(), "node_modules", ".bin", "bird");

interface BirdTweet {
  id: string;
  text: string;
  createdAt: string;
  replyCount: number;
  retweetCount: number;
  likeCount: number;
  author: { username: string; name: string };
  authorId: string;
  media?: Array<{ type: string; url: string }>;
  _raw?: {
    legacy?: {
      bookmark_count?: number;
      quote_count?: number;
    };
    views?: {
      count?: string;
    };
    core?: {
      user_results?: {
        result?: {
          core?: { name: string; screen_name: string };
          avatar?: { image_url: string };
          legacy?: {
            followers_count: number;
            friends_count: number;
            statuses_count: number;
            description?: string;
          };
          profile_bio?: { description: string };
        };
      };
    };
  };
}

export interface UserInfo {
  name: string;
  username: string;
  followers: number;
  following: number;
  tweetCount: number;
  profileImageUrl: string;
  description: string;
}

async function runBird(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(BIRD_BIN, args, {
      env: { ...process.env, NO_COLOR: "1" },
      timeout: 120000,
    });

    const chunks: Buffer[] = [];
    const errChunks: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => errChunks.push(chunk));

    child.on("close", () => {
      const stdout = Buffer.concat(chunks).toString();
      const stderr = Buffer.concat(errChunks).toString();

      // If we got JSON data in stdout, it's a success regardless of exit code
      if (stdout.includes("[")) {
        resolve(stdout);
        return;
      }

      // No data — check stderr for useful errors
      const msg = stderr || "bird returned no data";
      if (msg.includes("429") || msg.includes("Rate limit")) {
        reject(new Error("Rate limited by X — wait a few minutes and try again"));
      } else if (msg.includes("User not found") || msg.includes("UserUnavailable") || msg.includes("Could not find user")) {
        reject(new Error("User not found"));
      } else if (msg.includes("No Twitter cookies")) {
        reject(new Error("Not logged into X. Please log into x.com in a browser first."));
      } else {
        reject(new Error(`bird error: ${msg.slice(0, 300)}`));
      }
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to run bird: ${err.message}`));
    });
  });
}

function parseBirdJson(output: string): BirdTweet[] {
  // bird outputs warnings to stderr but JSON to stdout
  // Find the JSON array in the output
  const jsonStart = output.indexOf("[");
  if (jsonStart === -1) throw new Error("No tweet data returned");
  let jsonStr = output.slice(jsonStart);

  // Bird appends a {nextCursor:...} object after the array when paging.
  // We need to find where the array ends and cut there.
  // Find the matching closing bracket for the opening [
  let depth = 0;
  let arrayEnd = -1;
  for (let i = 0; i < jsonStr.length; i++) {
    if (jsonStr[i] === "[") depth++;
    else if (jsonStr[i] === "]") {
      depth--;
      if (depth === 0) { arrayEnd = i; break; }
    }
  }

  if (arrayEnd > 0) {
    jsonStr = jsonStr.slice(0, arrayEnd + 1);
  }

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Fallback: try to find last complete object
    const lastComplete = jsonStr.lastIndexOf("},");
    if (lastComplete > 0) {
      try {
        return JSON.parse(jsonStr.slice(0, lastComplete + 1) + "]");
      } catch {
        // fall through
      }
    }
    throw new Error("Failed to parse tweet data — try again");
  }
}

/** Convert bird tweet format to our Tweet format */
function toBirdTweet(bt: BirdTweet): Tweet {
  const impressions = bt._raw?.views?.count ? parseInt(bt._raw.views.count, 10) : 0;
  const bookmarks = bt._raw?.legacy?.bookmark_count ?? 0;
  const quotes = bt._raw?.legacy?.quote_count ?? 0;

  return {
    id: bt.id,
    text: bt.text,
    created_at: new Date(bt.createdAt).toISOString(),
    public_metrics: {
      like_count: bt.likeCount,
      reply_count: bt.replyCount,
      retweet_count: bt.retweetCount,
      quote_count: quotes,
      impression_count: impressions,
      bookmark_count: bookmarks,
    },
    attachments: bt.media?.length
      ? { media_keys: bt.media.map((_, i) => `media_${bt.id}_${i}`) }
      : undefined,
  };
}

/** Extract media info from bird tweet */
function extractMedia(bt: BirdTweet): Record<string, MediaInfo[]> {
  const map: Record<string, MediaInfo[]> = {};
  if (bt.media) {
    bt.media.forEach((m, i) => {
      const key = `media_${bt.id}_${i}`;
      map[key] = [{
        type: m.type as MediaInfo["type"],
        media_key: key,
      }];
    });
  }
  return map;
}

/** Extract user info from the first tweet's raw data */
function extractUser(birdTweets: BirdTweet[], username: string): UserInfo {
  const raw = birdTweets[0]?._raw;
  const userResult = raw?.core?.user_results?.result;
  const legacy = userResult?.legacy;

  return {
    name: userResult?.core?.name || username,
    username: userResult?.core?.screen_name || username,
    followers: legacy?.followers_count ?? 0,
    following: legacy?.friends_count ?? 0,
    tweetCount: legacy?.statuses_count ?? 0,
    profileImageUrl: userResult?.avatar?.image_url?.replace("_normal", "_200x200") || "",
    description: userResult?.profile_bio?.description || legacy?.description || "",
  };
}

export async function fetchUserAndTweets(username: string): Promise<{
  user: UserInfo;
  tweets: Tweet[];
  mediaMap: Record<string, MediaInfo[]>;
}> {
  const cleanUsername = username.replace(/^@/, "").trim();

  const output = await runBird([
    "user-tweets",
    cleanUsername,
    "-n", "50",
    "--max-pages", "3",
    "--json-full",
  ]);

  const birdTweets = parseBirdJson(output);

  if (birdTweets.length === 0) {
    throw new Error(`@${cleanUsername} has no recent public tweets to analyze`);
  }

  const user = extractUser(birdTweets, cleanUsername);

  // Filter out replies and retweets — only score original posts
  const originalTweets = birdTweets.filter((bt) => {
    // Skip retweets (text starts with "RT @")
    if (bt.text.startsWith("RT @")) return false;
    // Skip replies (conversationId differs from tweet id = it's a reply)
    if (bt.conversationId && bt.conversationId !== bt.id) return false;
    return true;
  });

  const tweets = originalTweets.map(toBirdTweet);

  // Merge all media maps
  const mediaMap: Record<string, MediaInfo[]> = {};
  for (const bt of originalTweets) {
    Object.assign(mediaMap, extractMedia(bt));
  }

  return { user, tweets, mediaMap };
}
