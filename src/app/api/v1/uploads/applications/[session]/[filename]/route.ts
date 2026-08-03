import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";
const TOKEN_KEY = "sahayatri.session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ session: string; filename: string }> },
) {
  const { session, filename } = await params;
  const decodedFilename = decodeURIComponent(filename);

  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_KEY)?.value;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(
    `${BACKEND}/api/v1/uploads/applications/${session}/${encodeURIComponent(decodedFilename)}`,
    { headers },
  );

  if (!res.ok) {
    return new NextResponse(null, { status: res.status });
  }

  const contentType =
    res.headers.get("content-type") ?? "application/octet-stream";
  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
