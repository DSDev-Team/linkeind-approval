import { NextResponse, type NextRequest } from "next/server";
import { authenticateWithPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const password = (body.password ?? "").trim();
  if (!password) {
    return NextResponse.json({ error: "Password required." }, { status: 400 });
  }
  const result = await authenticateWithPassword(password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Login failed." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}