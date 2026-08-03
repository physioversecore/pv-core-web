import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");
const TOKEN_KEY = "sahayatri.session";

async function authHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_KEY)?.value;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ therapistId: string }> },
) {
  const { therapistId } = await params;

  const formData = await request.formData();
  const body = new FormData();

  const file = formData.get("file");
  if (file instanceof File) body.append("file", file);

  const headers = await authHeaders();

  const res = await fetch(
    `${BACKEND}/api/v1/uploads/therapists/${encodeURIComponent(therapistId)}/photo`,
    { method: "POST", headers, body },
  );

  const data = await res.json().catch(() => null);
  return NextResponse.json(data ?? { message: "Upload failed" }, { status: res.status });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ therapistId: string }> },
) {
  const { therapistId } = await params;

  const headers = await authHeaders();

  const res = await fetch(
    `${BACKEND}/api/v1/uploads/therapists/${encodeURIComponent(therapistId)}/photo`,
    { method: "DELETE", headers },
  );

  const data = await res.json().catch(() => null);
  return NextResponse.json(data ?? { message: "Delete failed" }, { status: res.status });
}
