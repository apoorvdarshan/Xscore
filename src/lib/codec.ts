/**
 * Codec for encoding/decoding xscore analysis results into URL-safe strings.
 *
 * Compresses UserInfo + AccountAnalysis into a compact format,
 * zlib-compresses it, and encodes as base64url for use in URL fragments.
 */

import pako from "pako";
import {
  ACTIONS,
  WEIGHTS,
  type ActionName,
  type AccountAnalysis,
  type TweetAnalysis,
  type TweetSignals,
} from "./algorithm";
import type { UserInfo } from "./twitter";

// Max tweets to include in the encoded payload
const MAX_TWEETS = 15;
const MAX_TEXT_LEN = 180;
const MAX_DESC_LEN = 100;

interface CompactTweet {
  i: string;        // id
  t: string;        // text
  c: string;        // created_at
  m: number[];      // [likes, replies, retweets, quotes, impressions, bookmarks]
  p: number[];      // 19 probabilities
  ns: number;       // normalized score
}

interface CompactPayload {
  v: 1;
  u: {
    n: string;       // name
    h: string;       // handle
    f: number;       // followers
    g: number;       // following
    tc: number;      // tweet count
    p: string;       // profile image url
    d: string;       // description
  };
  s: number;         // overall score
  hr: string[];      // hurting reach
  hp: string[];      // helping reach
  tw: CompactTweet[];
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encode(user: UserInfo, analysis: AccountAnalysis): string {
  // Take top 10 and bottom 5 tweets (already sorted by primaryScore desc)
  const sorted = [...analysis.tweets].sort(
    (a, b) => b.signals.primaryScore - a.signals.primaryScore
  );
  const top = sorted.slice(0, 10);
  const bottom = sorted.slice(-5);
  // Deduplicate in case there are fewer than 15 tweets
  const seen = new Set(top.map((t) => t.tweet.id));
  const selected = [...top];
  for (const t of bottom) {
    if (!seen.has(t.tweet.id)) {
      selected.push(t);
      seen.add(t.tweet.id);
    }
  }

  const compact: CompactPayload = {
    v: 1,
    u: {
      n: user.name,
      h: user.username,
      f: user.followers,
      g: user.following,
      tc: user.tweetCount,
      p: user.profileImageUrl,
      d: (user.description || "").slice(0, MAX_DESC_LEN),
    },
    s: analysis.overallScore,
    hr: analysis.hurtingReach,
    hp: analysis.helpingReach,
    tw: selected.map((ta) => ({
      i: ta.tweet.id,
      t: ta.tweet.text.slice(0, MAX_TEXT_LEN),
      c: ta.tweet.created_at,
      m: [
        ta.tweet.public_metrics.like_count,
        ta.tweet.public_metrics.reply_count,
        ta.tweet.public_metrics.retweet_count,
        ta.tweet.public_metrics.quote_count,
        ta.tweet.public_metrics.impression_count,
        ta.tweet.public_metrics.bookmark_count,
      ],
      p: ACTIONS.map((a) => +ta.signals.probabilities[a].toFixed(5)),
      ns: +ta.normalizedScore.toFixed(1),
    })),
  };

  const json = JSON.stringify(compact);
  const compressed = pako.deflate(json);
  return toBase64Url(compressed);
}

export function decode(encoded: string): { user: UserInfo; analysis: AccountAnalysis } {
  const compressed = fromBase64Url(encoded);
  const json = pako.inflate(compressed, { to: "string" });
  const compact: CompactPayload = JSON.parse(json);

  const user: UserInfo = {
    name: compact.u.n,
    username: compact.u.h,
    followers: compact.u.f,
    following: compact.u.g,
    tweetCount: compact.u.tc,
    profileImageUrl: compact.u.p,
    description: compact.u.d,
  };

  // Reconstruct full TweetAnalysis objects
  const tweets: TweetAnalysis[] = compact.tw.map((ct) => {
    const probabilities = {} as Record<ActionName, number>;
    const contributions = {} as Record<ActionName, number>;
    let weightedScore = 0;

    ACTIONS.forEach((action, idx) => {
      const p = ct.p[idx] ?? 0;
      probabilities[action] = p;
      const w = WEIGHTS[action].value;
      contributions[action] = w * p;
      weightedScore += w * p;
    });

    const signals: TweetSignals = {
      probabilities,
      contributions,
      weightedScore,
      primaryScore: probabilities.favorite_score,
    };

    return {
      tweet: {
        id: ct.i,
        text: ct.t,
        created_at: ct.c,
        public_metrics: {
          like_count: ct.m[0],
          reply_count: ct.m[1],
          retweet_count: ct.m[2],
          quote_count: ct.m[3],
          impression_count: ct.m[4],
          bookmark_count: ct.m[5],
        },
      },
      signals,
      normalizedScore: ct.ns,
    };
  });

  // Recompute signal averages
  const signalAverages = {} as Record<ActionName, number>;
  for (const action of ACTIONS) {
    const sum = tweets.reduce((s, ta) => s + ta.signals.probabilities[action], 0);
    signalAverages[action] = tweets.length > 0 ? sum / tweets.length : 0;
  }

  // Best/worst by primaryScore
  const sorted = [...tweets].sort(
    (a, b) => b.signals.primaryScore - a.signals.primaryScore
  );

  const analysis: AccountAnalysis = {
    username: compact.u.h,
    overallScore: compact.s,
    tweets: sorted,
    signalAverages,
    bestTweet: sorted[0] || null,
    worstTweet: sorted[sorted.length - 1] || null,
    hurtingReach: compact.hr,
    helpingReach: compact.hp,
  };

  return { user, analysis };
}
