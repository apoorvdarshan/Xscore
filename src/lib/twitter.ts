/**
 * X data fetcher using @steipete/bird CLI.
 *
 * Uses browser cookies (Chrome) to access X's internal GraphQL API.
 * No API key or bearer token needed.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { Tweet, MediaInfo } from "./algorithm";

const execFileAsync = promisify(execFile);

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
  try {
    const { stdout, stderr } = await execFileAsync(BIRD_BIN, args, {
      timeout: 120000,
      maxBuffer: 50 * 1024 * 1024, // 50MB — --json-full is ~14KB/tweet
      env: { ...process.env, NO_COLOR: "1" },
    });
    // Bird outputs warnings to stderr (e.g. Safari not found) even on success.
    // Only treat it as an error if stdout has no data.
    if (!stdout.trim() && stderr) {
      throw new Error(stderr);
    }
    return stdout;
  } catch (err: unknown) {
    const error = err as Error & { stderr?: string; stdout?: string };
    // If stdout has JSON data, the command succeeded despite stderr warnings
    if (error.stdout && error.stdout.includes("[")) {
      return error.stdout;
    }
    const msg = error.stderr || error.message || "bird command failed";
    // Only flag cookie error if ALL browsers failed (no stdout)
    if (msg.includes("No Twitter cookies") && !msg.includes("Chrome")) {
      throw new Error("Not logged into X. Please log into x.com in a browser first.");
    }
    if (msg.includes("User not found") || msg.includes("UserUnavailable")) {
      throw new Error("User not found");
    }
    if (msg.includes("Could not find user")) {
      throw new Error("User not found");
    }
    throw new Error(`bird error: ${msg}`);
  }
}

function parseBirdJson(output: string): BirdTweet[] {
  // bird outputs warnings to stderr but JSON to stdout
  // Find the JSON array in the output
  const jsonStart = output.indexOf("[");
  if (jsonStart === -1) throw new Error("No tweet data returned");
  let jsonStr = output.slice(jsonStart);

  // Try parsing as-is first
  try {
    return JSON.parse(jsonStr);
  } catch {
    // JSON might be truncated — try to salvage by finding the last complete object
    // Look for the last "}," or "}\n]" pattern
    const lastComplete = jsonStr.lastIndexOf("},");
    if (lastComplete > 0) {
      jsonStr = jsonStr.slice(0, lastComplete + 1) + "]";
      try {
        return JSON.parse(jsonStr);
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
    "-n", "100",
    "--max-pages", "5",
    "--json-full",
  ]);

  const birdTweets = parseBirdJson(output);

  if (birdTweets.length === 0) {
    throw new Error(`@${cleanUsername} has no recent public tweets to analyze`);
  }

  const user = extractUser(birdTweets, cleanUsername);
  const tweets = birdTweets.map(toBirdTweet);

  // Merge all media maps
  const mediaMap: Record<string, MediaInfo[]> = {};
  for (const bt of birdTweets) {
    Object.assign(mediaMap, extractMedia(bt));
  }

  return { user, tweets, mediaMap };
}
