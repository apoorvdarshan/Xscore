/**
 * X API v2 client for fetching user tweets.
 *
 * Uses Bearer Token authentication from .env (X_BEARER_TOKEN).
 * Fetches the last 20 public tweets with engagement metrics.
 */

import { Tweet, MediaInfo } from "./algorithm";

const API_BASE = "https://api.x.com/2";

function getHeaders(): HeadersInit {
  const token = process.env.X_BEARER_TOKEN;
  if (!token || token === "your_bearer_token_here") {
    throw new Error("X_BEARER_TOKEN not configured. Set it in .env.local");
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

interface UserResponse {
  data: {
    id: string;
    name: string;
    username: string;
    public_metrics: {
      followers_count: number;
      following_count: number;
      tweet_count: number;
    };
    profile_image_url: string;
    description: string;
  };
}

interface TweetsResponse {
  data: Tweet[];
  includes?: {
    media?: Array<{
      media_key: string;
      type: "photo" | "video" | "animated_gif";
    }>;
  };
  meta: {
    result_count: number;
  };
}

export async function fetchUser(username: string): Promise<UserResponse["data"]> {
  const url = `${API_BASE}/users/by/username/${encodeURIComponent(username)}?user.fields=public_metrics,profile_image_url,description`;
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401) throw new Error("Invalid X_BEARER_TOKEN");
    if (res.status === 404) throw new Error(`User @${username} not found`);
    if (res.status === 429) throw new Error("Rate limited by X API — try again in a few minutes");
    throw new Error(`X API error (${res.status}): ${body}`);
  }

  const json: UserResponse = await res.json();
  if (!json.data) throw new Error(`User @${username} not found`);
  return json.data;
}

export async function fetchRecentTweets(
  userId: string
): Promise<{ tweets: Tweet[]; mediaMap: Record<string, MediaInfo[]> }> {
  const url =
    `${API_BASE}/users/${userId}/tweets?` +
    new URLSearchParams({
      max_results: "20",
      "tweet.fields": "created_at,public_metrics,attachments",
      expansions: "attachments.media_keys",
      "media.fields": "type,media_key",
      exclude: "retweets,replies",
    }).toString();

  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("Rate limited by X API — try again in a few minutes");
    throw new Error(`X API error (${res.status}): ${body}`);
  }

  const json: TweetsResponse = await res.json();

  const mediaMap: Record<string, MediaInfo[]> = {};
  if (json.includes?.media) {
    for (const m of json.includes.media) {
      mediaMap[m.media_key] = [{ type: m.type, media_key: m.media_key }];
    }
  }

  return {
    tweets: json.data || [],
    mediaMap,
  };
}
