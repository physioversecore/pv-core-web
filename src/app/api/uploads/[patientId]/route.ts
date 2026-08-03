import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");
const TOKEN_KEY = "sahayatri.session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> },
) {
  const { patientId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_KEY)?.value;

  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ detail: "No file provided" }, { status: 400 });
  }

  const backendFormData = new FormData();
  backendFormData.append("file", file);

  const res = await fetch(`${BACKEND}/api/v1/uploads/${patientId}`, {
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
