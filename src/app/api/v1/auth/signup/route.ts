import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";
const TOKEN_KEY = "sahayatri.session";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${BACKEND}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return NextResponse.json(
      { detail: data?.detail ?? `Backend error ${res.status}` },
      { status: res.status },
    );
  }

  const data = await res.json();
  const response = NextResponse.json(data);

  // Patients are auto-logged-in (therapist signup returns access_token: null).
  if (data?.access_token) {
    response.cookies.set(TOKEN_KEY, data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  return response;
}
