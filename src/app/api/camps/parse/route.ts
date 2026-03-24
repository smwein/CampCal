import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a camp information extractor. Given a text description of a summer camp, extract structured data. Return ONLY valid JSON with these fields (omit any that aren't mentioned):

{
  "name": "camp name",
  "organization": "organization running the camp",
  "address": "full address",
  "zip_code": "zip code",
  "category": "sports|arts|science|outdoors|academic|mixed",
  "duration_type": "full_day|half_day|extended",
  "age_min": 6,
  "age_max": 10,
  "cost_per_week": 385,
  "url": "https://...",
  "start_date": "2026-06-15",
  "end_date": "2026-06-19"
}

Rules:
- cost_per_week should be a number (no $ sign)
- dates in YYYY-MM-DD format
- If the year isn't specified, assume 2026
- category should be one of: sports, arts, science, outdoors, academic, mixed
- duration_type: full_day (6+ hours), half_day (under 5 hours), extended (before/after care)
- Return ONLY the JSON object, no markdown, no explanation`;

export async function POST(request: Request) {
  const { text } = await request.json();

  if (!text || typeof text !== "string" || text.length > 5000) {
    return NextResponse.json(
      { error: "Invalid input" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: text }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: "LLM service unavailable" },
        { status: 502 }
      );
    }

    const result = await response.json();
    const content = result.content?.[0]?.text;

    if (!content) {
      return NextResponse.json(
        { error: "Empty response from LLM" },
        { status: 502 }
      );
    }

    // Parse the JSON response, handling potential markdown wrapping
    const jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Could not parse camp details" },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: "Failed to extract camp details" },
      { status: 500 }
    );
  }
}
