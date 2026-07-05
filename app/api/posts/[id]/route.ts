import { NextResponse, type NextRequest } from "next/server";
import { getStorage } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getStorage();
  const existing = await store.getPost(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Status-only review path
  if (typeof body.status === "string") {
    const allowed = ["pending", "approved", "rejected", "changes_requested"];
    if (!allowed.includes(body.status as string)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const post = await store.setStatus(
      id,
      body.status as "pending" | "approved" | "rejected" | "changes_requested",
      typeof body.feedback === "string" ? body.feedback : undefined
    );
    return NextResponse.json({ post });
  }

  // Generic edit path
  const patch: Record<string, unknown> = {};
  for (const k of [
    "headline",
    "body",
    "hashtags",
    "scheduledFor",
    "visualType",
    "visualUrl",
    "visualAlt",
    "author",
    "notes",
  ]) {
    if (body[k] !== undefined) patch[k] = body[k];
  }
  const post = await store.updatePost(id, patch);
  return NextResponse.json({ post });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getStorage();
  const existing = await store.getPost(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await store.updatePost(id, { status: "rejected" });
  return NextResponse.json({ ok: true });
}