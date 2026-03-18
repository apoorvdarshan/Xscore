/**
 * X Algorithm Scoring Engine
 *
 * All logic traced to: https://github.com/xai-org/x-algorithm
 *
 * KEY FINDING: The repo does NOT disclose specific numerical weights for the
 * weighted scorer formula. It only states:
 *   - "Final Score = Σ (weight_i × P(action_i))"
 *   - "Positive actions have positive weights. Negative actions have negative weights."
 *
 * Source: xai-org/x-algorithm README.md
 *
 * The 19 predicted actions are defined in:
 *   xai-org/x-algorithm/phoenix/runners.py — ACTIONS list
 *
 * The primary ranking uses P(favorite) (index 0) as the sort key:
 *   xai-org/x-algorithm/phoenix/runners.py — ranked_indices = jnp.argsort(-primary_scores)
 *   where primary_scores = probs[:, :, 0] (favorite_score)
 *
 * Probabilities are computed via sigmoid:
 *   xai-org/x-algorithm/phoenix/runners.py — probs = jax.nn.sigmoid(logits)
 */

// --- ACTION DEFINITIONS ---
// Source: xai-org/x-algorithm/phoenix/runners.py — ACTIONS list (19 actions)
export const ACTIONS = [
  "favorite_score",       // index 0 — PRIMARY ranking signal
  "reply_score",          // index 1
  "repost_score",         // index 2
  "photo_expand_score",   // index 3
  "click_score",          // index 4
  "profile_click_score",  // index 5
  "vqv_score",            // index 6 — video qualified view
  "share_score",          // index 7
  "share_via_dm_score",   // index 8
  "share_via_copy_link_score", // index 9
  "dwell_score",          // index 10
  "quote_score",          // index 11
  "quoted_click_score",   // index 12
  "follow_author_score",  // index 13
  "not_interested_score", // index 14 — NEGATIVE signal
  "block_author_score",   // index 15 — NEGATIVE signal
  "mute_author_score",    // index 16 — NEGATIVE signal
  "report_score",         // index 17 — NEGATIVE signal
  "dwell_time",           // index 18
] as const;

export type ActionName = (typeof ACTIONS)[number];

// Human-readable labels for display
export const ACTION_LABELS: Record<ActionName, string> = {
  favorite_score: "Like",
  reply_score: "Reply",
  repost_score: "Repost",
  photo_expand_score: "Photo Expand",
  click_score: "Click",
  profile_click_score: "Profile Click",
  vqv_score: "Video View (Qualified)",
  share_score: "Share",
  share_via_dm_score: "Share via DM",
  share_via_copy_link_score: "Share via Copy Link",
  dwell_score: "Dwell",
  quote_score: "Quote",
  quoted_click_score: "Quoted Click",
  follow_author_score: "Follow Author",
  not_interested_score: "Not Interested",
  block_author_score: "Block Author",
  mute_author_score: "Mute Author",
  report_score: "Report",
  dwell_time: "Dwell Time",
};

/**
 * Signal polarity — derived from xai-org/x-algorithm README.md:
 * "Positive actions (like, repost, share) have positive weights.
 *  Negative actions (block, mute, report) have negative weights."
 */
export const SIGNAL_POLARITY: Record<ActionName, "positive" | "negative"> = {
  favorite_score: "positive",
  reply_score: "positive",
  repost_score: "positive",
  photo_expand_score: "positive",
  click_score: "positive",
  profile_click_score: "positive",
  vqv_score: "positive",
  share_score: "positive",
  share_via_dm_score: "positive",
  share_via_copy_link_score: "positive",
  dwell_score: "positive",
  quote_score: "positive",
  quoted_click_score: "positive",
  follow_author_score: "positive",
  not_interested_score: "negative",
  block_author_score: "negative",
  mute_author_score: "negative",
  report_score: "negative",
  dwell_time: "positive",
};

/**
 * IMPORTANT: These weights are NOT from the repo.
 * The repo states the formula but does NOT disclose specific weight values.
 * The weights below are marked as "not specified in repo" in the UI.
 *
 * We set all weights to 1.0 (positive) or -1.0 (negative) to avoid
 * inventing numbers. This means the score reflects raw engagement
 * probability sums, not the actual production ranking.
 */
export const WEIGHTS: Record<ActionName, { value: number; source: string }> = {
  favorite_score: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
  reply_score: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
  repost_score: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
  photo_expand_score: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
  click_score: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
  profile_click_score: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
  vqv_score: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
  share_score: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
  share_via_dm_score: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
  share_via_copy_link_score: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
  dwell_score: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
  quote_score: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
  quoted_click_score: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
  follow_author_score: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
  not_interested_score: { value: -1.0, source: "not specified in repo — using ±1.0 placeholder" },
  block_author_score: { value: -1.0, source: "not specified in repo — using ±1.0 placeholder" },
  mute_author_score: { value: -1.0, source: "not specified in repo — using ±1.0 placeholder" },
  report_score: { value: -1.0, source: "not specified in repo — using ±1.0 placeholder" },
  dwell_time: { value: 1.0, source: "not specified in repo — using ±1.0 placeholder" },
};

// --- TYPES ---

export interface TweetMetrics {
  like_count: number;
  reply_count: number;
  retweet_count: number;
  quote_count: number;
  impression_count: number;
  bookmark_count: number;
}

export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics: TweetMetrics;
  attachments?: {
    media_keys?: string[];
  };
}

export interface MediaInfo {
  type: "photo" | "video" | "animated_gif";
  media_key: string;
}

export interface TweetSignals {
  /** Estimated P(action) for each of the 19 signals */
  probabilities: Record<ActionName, number>;
  /** Weighted contribution: weight × P(action) */
  contributions: Record<ActionName, number>;
  /** Final Score = Σ (weight × P(action)) — formula from xai-org/x-algorithm README.md */
  weightedScore: number;
  /** Primary score = P(favorite) — from runners.py: primary_scores = probs[:, :, 0] */
  primaryScore: number;
}

export interface TweetAnalysis {
  tweet: Tweet;
  signals: TweetSignals;
  normalizedScore: number; // 0-100
}

export interface AccountAnalysis {
  username: string;
  overallScore: number; // 0-100
  tweets: TweetAnalysis[];
  signalAverages: Record<ActionName, number>;
  bestTweet: TweetAnalysis | null;
  worstTweet: TweetAnalysis | null;
  hurtingReach: string[];
  helpingReach: string[];
}

// --- SCORING ---

/**
 * Estimate engagement probabilities from tweet metrics.
 *
 * Since we cannot run the actual Phoenix transformer model
 * (xai-org/x-algorithm/phoenix/recsys_model.py), we approximate
 * P(action) from observed engagement rates.
 *
 * The real model outputs probabilities via sigmoid:
 *   probs = jax.nn.sigmoid(logits)
 *   — Source: xai-org/x-algorithm/phoenix/runners.py
 *
 * Our approximation: engagement_count / impression_count
 * This gives the observed rate, which is a rough proxy for P(action).
 */
export function estimateProbabilities(
  tweet: Tweet,
  media: MediaInfo[],
  followerCount: number
): Record<ActionName, number> {
  const m = tweet.public_metrics;
  const impressions = m.impression_count || 1;
  const hasPhoto = media.some((med) => med.type === "photo");
  const hasVideo = media.some((med) => med.type === "video" || med.type === "animated_gif");
  const textLength = tweet.text.length;

  // P(favorite) — index 0, PRIMARY ranking signal
  // Source: runners.py — primary_scores = probs[:, :, 0]
  const p_favorite = Math.min(m.like_count / impressions, 1.0);

  // P(reply) — index 1
  const p_reply = Math.min(m.reply_count / impressions, 1.0);

  // P(repost) — index 2
  const p_repost = Math.min(m.retweet_count / impressions, 1.0);

  // P(photo_expand) — index 3: only nonzero if tweet has photos
  const p_photo_expand = hasPhoto ? Math.min(m.like_count * 0.3 / impressions, 1.0) : 0;

  // P(click) — index 4: estimated from engagement
  const p_click = Math.min((m.like_count + m.reply_count + m.retweet_count) * 0.5 / impressions, 1.0);

  // P(profile_click) — index 5: estimated from follow-worthy engagement
  const p_profile_click = Math.min((m.like_count + m.reply_count) * 0.1 / impressions, 1.0);

  // P(vqv) — index 6: video qualified view, only if video present
  const p_vqv = hasVideo ? Math.min(m.like_count * 0.5 / impressions, 1.0) : 0;

  // P(share) — index 7: bookmark is closest proxy
  const p_share = Math.min(m.bookmark_count / impressions, 1.0);

  // P(share_via_dm) — index 8: fraction of shares
  const p_share_dm = Math.min(m.bookmark_count * 0.2 / impressions, 1.0);

  // P(share_via_copy_link) — index 9: fraction of shares
  const p_share_copy = Math.min(m.bookmark_count * 0.3 / impressions, 1.0);

  // P(dwell) — index 10: longer text → higher dwell probability
  const dwellFactor = Math.min(textLength / 280, 1.0);
  const p_dwell = Math.min(dwellFactor * 0.5 + (m.like_count / impressions) * 0.3, 1.0);

  // P(quote) — index 11
  const p_quote = Math.min(m.quote_count / impressions, 1.0);

  // P(quoted_click) — index 12
  const p_quoted_click = Math.min(m.quote_count * 0.5 / impressions, 1.0);

  // P(follow_author) — index 13
  const p_follow = Math.min(
    (m.like_count + m.reply_count) * 0.05 / Math.max(impressions, 1),
    1.0
  );

  // NEGATIVE SIGNALS — these hurt your score
  // We estimate these as very low for public metrics (we can't observe them)
  // but penalize tweets with very low engagement ratios

  const engagementRate = (m.like_count + m.reply_count + m.retweet_count) / impressions;

  // P(not_interested) — index 14
  const p_not_interested = Math.max(0, Math.min(0.05 - engagementRate * 0.5, 0.05));

  // P(block_author) — index 15
  const p_block = Math.max(0, Math.min(0.01 - engagementRate * 0.1, 0.01));

  // P(mute_author) — index 16
  const p_mute = Math.max(0, Math.min(0.02 - engagementRate * 0.2, 0.02));

  // P(report) — index 17
  const p_report = Math.max(0, Math.min(0.005 - engagementRate * 0.05, 0.005));

  // dwell_time — index 18: estimated seconds of attention
  // Normalized to 0-1 range (assuming max ~60s meaningful dwell)
  const estimatedDwell = Math.min(textLength / 280, 1.0) * 30 + (hasVideo ? 20 : 0);
  const p_dwell_time = Math.min(estimatedDwell / 60, 1.0);

  return {
    favorite_score: p_favorite,
    reply_score: p_reply,
    repost_score: p_repost,
    photo_expand_score: p_photo_expand,
    click_score: p_click,
    profile_click_score: p_profile_click,
    vqv_score: p_vqv,
    share_score: p_share,
    share_via_dm_score: p_share_dm,
    share_via_copy_link_score: p_share_copy,
    dwell_score: p_dwell,
    quote_score: p_quote,
    quoted_click_score: p_quoted_click,
    follow_author_score: p_follow,
    not_interested_score: p_not_interested,
    block_author_score: p_block,
    mute_author_score: p_mute,
    report_score: p_report,
    dwell_time: p_dwell_time,
  };
}

/**
 * Compute the weighted score for a tweet.
 *
 * Formula: Final Score = Σ (weight_i × P(action_i))
 * Source: xai-org/x-algorithm README.md — "Weighted Score = Σ (weight × P(action))"
 *
 * Note: Since actual weights are not disclosed in the repo,
 * we use ±1.0 placeholders. The score reflects summed probabilities
 * with negative signals subtracted.
 */
export function scoreTweet(
  tweet: Tweet,
  media: MediaInfo[],
  followerCount: number
): TweetSignals {
  const probabilities = estimateProbabilities(tweet, media, followerCount);

  // Weighted Score = Σ (weight_i × P(action_i))
  // Source: xai-org/x-algorithm README.md
  const contributions = {} as Record<ActionName, number>;
  let weightedScore = 0;

  for (const action of ACTIONS) {
    const weight = WEIGHTS[action].value;
    const prob = probabilities[action];
    contributions[action] = weight * prob;
    weightedScore += weight * prob;
  }

  // Primary score = P(favorite) — index 0
  // Source: xai-org/x-algorithm/phoenix/runners.py
  //   primary_scores = probs[:, :, 0]
  //   ranked_indices = jnp.argsort(-primary_scores, axis=-1)
  const primaryScore = probabilities.favorite_score;

  return {
    probabilities,
    contributions,
    weightedScore,
    primaryScore,
  };
}

/**
 * Normalize raw weighted scores to 0-100 scale.
 * The maximum theoretical score with ±1.0 weights is ~15 (all positive signals at 1.0).
 * We use a practical scale based on observed score distribution.
 */
function normalizeScore(rawScore: number): number {
  // With ±1.0 weights, a very good tweet might score ~3-5
  // We map 0-5 → 0-100 with a sigmoid-like curve
  const normalized = (Math.tanh(rawScore / 3) + 1) / 2 * 100;
  return Math.round(Math.max(0, Math.min(100, normalized)));
}

/**
 * Analyze an account based on their recent tweets.
 *
 * Pipeline mirrors xai-org/x-algorithm architecture:
 *   1. Source tweets (candidate-pipeline/source.rs)
 *   2. Score each tweet (candidate-pipeline/scorer.rs → phoenix scorer)
 *   3. Rank by primary score (phoenix/runners.py — argsort on P(favorite))
 */
export function analyzeAccount(
  username: string,
  tweets: Tweet[],
  mediaMap: Record<string, MediaInfo[]>,
  followerCount: number
): AccountAnalysis {
  // Score each tweet
  const tweetAnalyses: TweetAnalysis[] = tweets.map((tweet) => {
    const mediaKeys = tweet.attachments?.media_keys || [];
    const media = mediaKeys.flatMap((key) => mediaMap[key] || []);
    const signals = scoreTweet(tweet, media, followerCount);
    return {
      tweet,
      signals,
      normalizedScore: normalizeScore(signals.weightedScore),
    };
  });

  // Sort by primary score (P(favorite)) descending
  // Source: xai-org/x-algorithm/phoenix/runners.py
  //   ranked_indices = jnp.argsort(-primary_scores, axis=-1)
  tweetAnalyses.sort((a, b) => b.signals.primaryScore - a.signals.primaryScore);

  // Compute signal averages across all tweets
  const signalAverages = {} as Record<ActionName, number>;
  for (const action of ACTIONS) {
    const avg =
      tweetAnalyses.reduce((sum, t) => sum + t.signals.probabilities[action], 0) /
      Math.max(tweetAnalyses.length, 1);
    signalAverages[action] = avg;
  }

  // Overall score = average of normalized scores
  const overallScore = Math.round(
    tweetAnalyses.reduce((sum, t) => sum + t.normalizedScore, 0) /
      Math.max(tweetAnalyses.length, 1)
  );

  // Best and worst tweets
  const bestTweet = tweetAnalyses.length > 0 ? tweetAnalyses[0] : null;
  const worstTweet =
    tweetAnalyses.length > 0 ? tweetAnalyses[tweetAnalyses.length - 1] : null;

  // What's hurting reach: identify weak positive signals and strong negative signals
  const hurtingReach: string[] = [];
  const helpingReach: string[] = [];

  for (const action of ACTIONS) {
    const avg = signalAverages[action];
    const polarity = SIGNAL_POLARITY[action];
    const label = ACTION_LABELS[action];

    if (polarity === "positive" && avg < 0.01) {
      hurtingReach.push(`Low ${label} rate (${(avg * 100).toFixed(2)}%) — this positive signal is underperforming`);
    } else if (polarity === "positive" && avg > 0.03) {
      helpingReach.push(`Strong ${label} rate (${(avg * 100).toFixed(2)}%) — boosting your score`);
    }

    if (polarity === "negative" && avg > 0.01) {
      hurtingReach.push(`Elevated ${label} signal (${(avg * 100).toFixed(2)}%) — negative signals reduce your score`);
    }
  }

  if (hurtingReach.length === 0) {
    hurtingReach.push("No major issues detected in observable metrics");
  }
  if (helpingReach.length === 0) {
    helpingReach.push("No standout positive signals detected — engagement rates are moderate");
  }

  return {
    username,
    overallScore,
    tweets: tweetAnalyses,
    signalAverages,
    bestTweet,
    worstTweet,
    hurtingReach,
    helpingReach,
  };
}
