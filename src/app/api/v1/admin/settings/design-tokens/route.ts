import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");
const TOKEN_KEY = "sahayatri.session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_KEY)?.value;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/api/v1/settings/design-tokens`, { headers });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ tokens: null }, { status: 200 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_KEY)?.value;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const body = await req.text();
    const res = await fetch(`${BACKEND}/api/v1/settings/design-tokens`, {
      method: "PUT",
      headers,
      body,
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
