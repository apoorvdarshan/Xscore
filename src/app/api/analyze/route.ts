import { NextRequest, NextResponse } from "next/server";
import { fetchUserAndTweets } from "@/lib/twitter";
import { analyzeAccount } from "@/lib/algorithm";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ error: "username parameter required" }, { status: 400 });
  }

  const cleanUsername = username.replace(/^@/, "").trim();
  if (!cleanUsername || !/^[a-zA-Z0-9_]{1,15}$/.test(cleanUsername)) {
    return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
  }

  try {
    const { user, tweets, mediaMap } = await fetchUserAndTweets(cleanUsername);

    const analysis = analyzeAccount(
      cleanUsername,
      tweets,
      mediaMap,
      user.followers
    );

    return NextResponse.json({ user, analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("not found")
      ? 404
      : message.includes("logged in")
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
