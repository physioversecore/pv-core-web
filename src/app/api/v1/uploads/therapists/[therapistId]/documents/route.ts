import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";
const TOKEN_KEY = "sahayatri.session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ therapistId: string }> },
) {
  const { therapistId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_KEY)?.value;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const formData = await request.formData();
  const body = new FormData();

  const documentType = formData.get("documentType");
  if (typeof documentType === "string") {
    body.append("documentType", documentType);
  }

  const files = formData.getAll("files");
  for (const file of files) {
    if (file instanceof File) body.append("files", file);
  }

  const res = await fetch(
    `${BACKEND}/api/v1/uploads/therapists/${encodeURIComponent(therapistId)}/documents`,
    { method: "POST", headers, body },
  );

  const data = await res.json().catch(() => null);
  return NextResponse.json(data ?? { message: "Upload failed" }, { status: res.status });
}
