# xscore

Analyze any X (Twitter) account against the [open-source X recommendation algorithm](https://github.com/xai-org/x-algorithm).

## How It Works

Enter an X username → fetches their last 20 public tweets via X API v2 → scores each tweet using the Phoenix weighted scorer formula → shows a breakdown of all 19 engagement signals.

## Algorithm Mapping

Every piece of scoring logic in this app traces back to a specific file in [xai-org/x-algorithm](https://github.com/xai-org/x-algorithm):

| App Component | Algorithm Source | What It Does |
|---|---|---|
| `src/lib/algorithm.ts` — `ACTIONS` array | `phoenix/runners.py` — `ACTIONS` list | The 19 predicted engagement signals |
| `src/lib/algorithm.ts` — `SIGNAL_POLARITY` | `README.md` — "Positive actions have positive weights. Negative actions have negative weights." | Classifies each signal as positive or negative |
| `src/lib/algorithm.ts` — `scoreTweet()` | `README.md` — "Final Score = Σ (weight_i × P(action_i))" | The weighted scorer formula |
| `src/lib/algorithm.ts` — `estimateProbabilities()` | `phoenix/runners.py` — `probs = jax.nn.sigmoid(logits)` | Approximates P(action) from tweet metrics (real model uses transformer) |
| `src/lib/algorithm.ts` — `primaryScore` | `phoenix/runners.py` — `primary_scores = probs[:, :, 0]` + `ranked_indices = jnp.argsort(-primary_scores)` | Primary ranking uses P(favorite) at index 0 |
| `src/lib/algorithm.ts` — `analyzeAccount()` pipeline | `candidate-pipeline/scorer.rs` → `phoenix/recsys_model.py` | Mirrors the source → filter → score → rank pipeline |
| `src/lib/algorithm.ts` — `WEIGHTS` | **NOT IN REPO** | Weights are not disclosed; we use ±1.0 placeholders and mark them clearly |

### The 19 Engagement Signals

From `phoenix/runners.py` — `ACTIONS` list:

| Index | Signal | Polarity | Weight in Repo |
|---|---|---|---|
| 0 | `favorite_score` (PRIMARY) | Positive | Not specified |
| 1 | `reply_score` | Positive | Not specified |
| 2 | `repost_score` | Positive | Not specified |
| 3 | `photo_expand_score` | Positive | Not specified |
| 4 | `click_score` | Positive | Not specified |
| 5 | `profile_click_score` | Positive | Not specified |
| 6 | `vqv_score` (video qualified view) | Positive | Not specified |
| 7 | `share_score` | Positive | Not specified |
| 8 | `share_via_dm_score` | Positive | Not specified |
| 9 | `share_via_copy_link_score` | Positive | Not specified |
| 10 | `dwell_score` | Positive | Not specified |
| 11 | `quote_score` | Positive | Not specified |
| 12 | `quoted_click_score` | Positive | Not specified |
| 13 | `follow_author_score` | Positive | Not specified |
| 14 | `not_interested_score` | **Negative** | Not specified |
| 15 | `block_author_score` | **Negative** | Not specified |
| 16 | `mute_author_score` | **Negative** | Not specified |
| 17 | `report_score` | **Negative** | Not specified |
| 18 | `dwell_time` | Positive | Not specified |

### What the Repo Specifies vs. What It Doesn't

**Specified in the repo:**
- The formula: `Final Score = Σ (weight_i × P(action_i))`
- The 19 predicted actions and their order (phoenix/runners.py)
- That positive actions get positive weights, negative actions get negative weights (README.md)
- That P(favorite) at index 0 is the primary ranking signal (phoenix/runners.py)
- That probabilities are computed via `sigmoid(logits)` (phoenix/runners.py)
- The transformer architecture with candidate isolation (phoenix/recsys_model.py)
- The pipeline stages: source → filter → hydrate → score → select (candidate-pipeline/)

**NOT specified in the repo:**
- The actual numerical weight values for each action
- The training data or user embeddings
- The model checkpoint/weights

## Setup

```bash
# Install dependencies
npm install

# Set your X API bearer token
cp .env.local.example .env.local
# Edit .env.local and set X_BEARER_TOKEN=your_token

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `X_BEARER_TOKEN` | X API v2 Bearer Token (required). Get one at [developer.x.com](https://developer.x.com) |

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- X API v2

## Limitations

1. **No real model inference** — We approximate P(action) from observable tweet metrics. The real Phoenix model uses a Grok-based transformer processing user embeddings, history sequences, and candidate embeddings.
2. **Weights are unknown** — The repo does not disclose the specific weight values used in the weighted scorer. All weights in the app are ±1.0 placeholders.
3. **No user personalization** — The real algorithm personalizes scores per-viewer. This app shows engagement rates from the author's perspective.
4. **Public metrics only** — We can't observe negative signals (block, mute, report, not_interested) from the API, so those are estimated.
