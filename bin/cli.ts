#!/usr/bin/env npx tsx

import { fetchUserAndTweets } from "../src/lib/twitter.js";
import { analyzeAccount, ACTIONS, ACTION_LABELS, SIGNAL_POLARITY } from "../src/lib/algorithm.js";
import { encode } from "../src/lib/codec.js";
import { exec } from "child_process";

const SITE_URL = "https://xscores.vercel.app";

function printBanner() {
  console.log();
  console.log("  \x1b[1m\x1b[36mxscore\x1b[0m — X Algorithm Analyzer");
  console.log("  ─────────────────────────────");
  console.log();
}

function printError(msg: string) {
  console.error(`  \x1b[31m✗\x1b[0m ${msg}`);
  console.log();
}

function printInfo(msg: string) {
  console.log(`  \x1b[90m${msg}\x1b[0m`);
}

function openBrowser(url: string) {
  const cmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  exec(`${cmd} "${url}"`);
}

async function main() {
  printBanner();

  const rawArg = process.argv[2];
  if (!rawArg) {
    console.log("  Usage: \x1b[1mnpx xscore @username\x1b[0m");
    console.log();
    printInfo("Analyzes any X account against the open-source algorithm.");
    printInfo("Requires: logged into x.com in a browser (uses cookies).");
    console.log();
    process.exit(0);
  }

  const username = rawArg.replace(/^@/, "").trim();
  if (!/^[a-zA-Z0-9_]{1,15}$/.test(username)) {
    printError(`Invalid username: ${rawArg}`);
    process.exit(1);
  }

  console.log(`  Analyzing \x1b[1m@${username}\x1b[0m ...`);
  console.log();

  try {
    // Fetch tweets
    printInfo("Fetching tweets via bird...");
    const { user, tweets, mediaMap } = await fetchUserAndTweets(username);
    printInfo(`Found ${tweets.length} tweets`);

    // Score
    printInfo("Running algorithm scoring...");
    const analysis = analyzeAccount(username, tweets, mediaMap, user.followers);

    // Print summary
    console.log();
    console.log(`  \x1b[1mScore: ${analysis.overallScore}/100\x1b[0m`);
    console.log(`  Tweets analyzed: ${analysis.tweets.length}`);

    // Top positive signal
    const topSignal = ACTIONS.filter((a) => SIGNAL_POLARITY[a] === "positive")
      .sort((a, b) => analysis.signalAverages[b] - analysis.signalAverages[a])[0];
    if (topSignal) {
      console.log(
        `  Top signal: ${ACTION_LABELS[topSignal]} (${(analysis.signalAverages[topSignal] * 100).toFixed(2)}%)`
      );
    }

    // Encode and open
    const encoded = encode(user, analysis);
    const url = `${SITE_URL}/#data=${encoded}`;

    console.log();
    console.log("  \x1b[32m✓\x1b[0m Opening results in browser...");
    console.log();
    printInfo(url.length > 120 ? url.slice(0, 117) + "..." : url);
    console.log();

    openBrowser(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    printError(msg);
    process.exit(1);
  }
}

main();
