import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const backendFormData = new FormData();
  for (const [key, value] of formData.entries()) {
    backendFormData.append(key, value);
  }

  const res = await fetch(`${BACKEND}/api/v1/uploads/therapist-application`, {
    method: "POST",
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
