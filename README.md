# xscore

Analyze any X (Twitter) account against the [open-source X recommendation algorithm](https://github.com/xai-org/x-algorithm). Run one command, get your score.

## Quick Start

```bash
npx -y @apoorvdarshan/xscore @username
```

That's it. Fetches tweets locally, scores 19 engagement signals, and opens a shareable results page in your browser.

**Prerequisites:**
- Node.js 18+
- Logged into [x.com](https://x.com) in Chrome, Edge, or Brave (uses browser cookies via [@steipete/bird](https://www.npmjs.com/package/@steipete/bird))

## How It Works

1. **Run the CLI** — `npx -y @apoorvdarshan/xscore @username`
2. **Local scoring** — Fetches last 50 tweets using your browser cookies, scores each against the Phoenix weighted scorer formula
3. **View results** — Opens [xscores.vercel.app](https://xscores.vercel.app) with your results encoded in the URL (shareable)

Your data never touches a server. Everything runs on your machine.

## What You Get

- **Overall score** (0-100) based on 19 engagement signals
- **Signal breakdown** — P(action) for likes, reposts, clicks, dwell time, etc.
- **Per-tweet ranking** — Every tweet ranked by P(favorite)
- **Insights** — What's boosting and hurting your reach
- **Shareable link** — Copy the URL and share it with anyone

## Algorithm Mapping

Every piece of scoring logic traces back to [xai-org/x-algorithm](https://github.com/xai-org/x-algorithm):

| App Component | Algorithm Source | What It Does |
|---|---|---|
| `src/lib/algorithm.ts` — `ACTIONS` | `phoenix/runners.py` — `ACTIONS` list | The 19 predicted engagement signals |
| `src/lib/algorithm.ts` — `SIGNAL_POLARITY` | `README.md` | Classifies each signal as positive or negative |
| `src/lib/algorithm.ts` — `scoreTweet()` | `README.md` — "Final Score = Σ (weight_i × P(action_i))" | The weighted scorer formula |
| `src/lib/algorithm.ts` — `estimateProbabilities()` | `phoenix/runners.py` — `probs = jax.nn.sigmoid(logits)` | Approximates P(action) from tweet metrics |
| `src/lib/algorithm.ts` — `primaryScore` | `phoenix/runners.py` — `primary_scores = probs[:, :, 0]` | Primary ranking uses P(favorite) |
| `src/lib/algorithm.ts` — `WEIGHTS` | **NOT IN REPO** | Weights are not disclosed; we use ±1.0 placeholders |

### The 19 Engagement Signals

From `phoenix/runners.py`:

| # | Signal | Polarity |
|---|---|---|
| 0 | `favorite_score` (PRIMARY) | Positive |
| 1 | `reply_score` | Positive |
| 2 | `repost_score` | Positive |
| 3 | `photo_expand_score` | Positive |
| 4 | `click_score` | Positive |
| 5 | `profile_click_score` | Positive |
| 6 | `vqv_score` (video qualified view) | Positive |
| 7 | `share_score` | Positive |
| 8 | `share_via_dm_score` | Positive |
| 9 | `share_via_copy_link_score` | Positive |
| 10 | `dwell_score` | Positive |
| 11 | `quote_score` | Positive |
| 12 | `quoted_click_score` | Positive |
| 13 | `follow_author_score` | Positive |
| 14 | `not_interested_score` | **Negative** |
| 15 | `block_author_score` | **Negative** |
| 16 | `mute_author_score` | **Negative** |
| 17 | `report_score` | **Negative** |
| 18 | `dwell_time` | Positive |

## Development

```bash
npm install
npm run dev
```

## Tech Stack

- **CLI**: Node.js + [@steipete/bird](https://www.npmjs.com/package/@steipete/bird)
- **Web**: Next.js, TypeScript, Tailwind CSS v4
- **Scoring**: Based on [xai-org/x-algorithm](https://github.com/xai-org/x-algorithm)

## Limitations

1. **No real model inference** — P(action) is approximated from tweet metrics. The real Phoenix model uses a Grok-based transformer.
2. **Weights are unknown** — The repo doesn't disclose weight values. All weights are ±1.0 placeholders.
3. **No personalization** — The real algorithm personalizes per-viewer. This shows engagement rates from the author's perspective.
4. **Public metrics only** — Negative signals (block, mute, report) are estimated since they aren't publicly observable.

## Disclaimer

This is an independent tool not affiliated with X. Uses [@steipete/bird](https://www.npmjs.com/package/@steipete/bird) for data access and [xai-org/x-algorithm](https://github.com/xai-org/x-algorithm) for scoring logic. Use at your own discretion.

## Author

Built by [Apoorv Darshan](https://x.com/apoorvdarshan)
