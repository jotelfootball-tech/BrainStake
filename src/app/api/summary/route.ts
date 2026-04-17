import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { score, total, avgTime, category } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const prompt = `You are a fun trivia game commentator. Generate a short, encouraging summary (2-3 sentences max) for a player who just completed a trivia game with the following stats:
- Score: ${score}/${total}
- Average time per question: ${avgTime} seconds
- Category: ${category || "mixed"}

Keep it brief, fun, and motivational. If they won, celebrate! If they lost, encourage them to try again.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic API error:", error);
      return NextResponse.json(
        { error: "Failed to generate summary" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const summary = data.content[0]?.text || "Great game! Keep practicing!";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}