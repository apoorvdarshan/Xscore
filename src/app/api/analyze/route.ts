import { NextRequest, NextResponse } from "next/server";
import { fetchUser, fetchRecentTweets } from "@/lib/twitter";
import { analyzeAccount } from "@/lib/algorithm";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ error: "username parameter required" }, { status: 400 });
  }

  // Strip @ prefix if provided
  const cleanUsername = username.replace(/^@/, "").trim();
  if (!cleanUsername || !/^[a-zA-Z0-9_]{1,15}$/.test(cleanUsername)) {
    return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
  }

  try {
    const user = await fetchUser(cleanUsername);
    const { tweets, mediaMap } = await fetchRecentTweets(user.id);

    if (tweets.length === 0) {
      return NextResponse.json(
        { error: `@${cleanUsername} has no recent public tweets to analyze` },
        { status: 404 }
      );
    }

    const analysis = analyzeAccount(
      cleanUsername,
      tweets,
      mediaMap,
      user.public_metrics.followers_count
    );

    return NextResponse.json({
      user: {
        name: user.name,
        username: user.username,
        followers: user.public_metrics.followers_count,
        following: user.public_metrics.following_count,
        tweetCount: user.public_metrics.tweet_count,
        profileImageUrl: user.profile_image_url,
        description: user.description,
      },
      analysis,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("not found")
      ? 404
      : message.includes("Rate limited")
        ? 429
        : message.includes("BEARER_TOKEN")
          ? 500
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
