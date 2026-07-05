import { NextResponse, type NextRequest } from "next/server";
import { getStorage } from "@/lib/store-context";
import { groupByWeek } from "@/lib/storage";
import { initStorage } from "@/lib/store-context";
import type { WeekHorizon } from "@/lib/weeks";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initStorage();
  const store = getStorage();
  const posts = await store.getAllPosts();
  const { searchParams } = new URL(req.url);
  const h = Number(searchParams.get("horizon") ?? "1");
  const horizon = (h === 2 || h === 3 ? h : 1) as WeekHorizon;
  const weeks = groupByWeek(posts, horizon);
  return NextResponse.json({
    weeks,
    horizon,
    backend: store.backendName(),
    kvConfigured: Boolean(
      process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ),
  });
}

export async function POST(req: NextRequest) {
  await initStorage();
  const store = getStorage();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const required: Array<keyof typeof body> = [
    "headline",
    "body",
    "scheduledFor",
    "visualType",
    "author",
  ];
  for (const k of required) {
    const v = body[k];
    if (v === undefined || v === null || v === "") {
      return NextResponse.json({ error: `Missing field: ${String(k)}` }, { status: 400 });
    }
  }
  const hashtags = Array.isArray(body.hashtags)
    ? (body.hashtags as string[]).map((h) => String(h).trim()).filter(Boolean)
    : typeof body.hashtags === "string"
      ? (body.hashtags as string)
          .split(",")
          .map((h) => h.trim())
          .filter(Boolean)
      : [];

  const post = await store.createPost({
    headline: String(body.headline),
    body: String(body.body),
    hashtags,
    scheduledFor: String(body.scheduledFor),
    visualType: (body.visualType as "image" | "carousel" | "video" | "document" | "text") ?? "text",
    visualUrl: body.visualUrl ? String(body.visualUrl) : undefined,
    visualAlt: body.visualAlt ? String(body.visualAlt) : undefined,
    author: String(body.author),
    notes: body.notes ? String(body.notes) : undefined,
  });
  return NextResponse.json({ post }, { status: 201 });
}