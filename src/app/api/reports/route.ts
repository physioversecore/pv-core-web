import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");
const TOKEN_KEY = "sahayatri.session";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_KEY)?.value;

  if (!token) {
    return NextResponse.json(
      { detail: "Not authenticated" },
      { status: 401 },
    );
  }

  const formData = await request.formData();

  const backendFormData = new FormData();
  for (const [key, value] of formData.entries()) {
    backendFormData.append(key, value);
  }

  const res = await fetch(`${BACKEND}/api/v1/reports`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: backendFormData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return NextResponse.json(
      { detail: body?.detail ?? `Backend error ${res.status}` },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
