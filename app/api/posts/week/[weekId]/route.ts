import { NextResponse, type NextRequest } from "next/server";
import { getStorage } from "@/lib/store-context";

export const dynamic = "force-dynamic";

// POST /api/posts/week/[weekId]  — approve the whole week in one shot.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  const { weekId } = await params;
  if (!/^\d{4}-W\d{2}$/.test(weekId)) {
    return NextResponse.json({ error: "Invalid weekId" }, { status: 400 });
  }
  const store = getStorage();
  const reviewer =
    typeof req.headers.get("x-approver") === "string"
      ? (req.headers.get("x-approver") as string)
      : "approver";
  const updated = await store.approveWeek(weekId, reviewer);
  return NextResponse.json({ weekId, approved: updated.length, posts: updated });
}