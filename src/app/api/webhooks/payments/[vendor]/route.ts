import { NextRequest, NextResponse } from "next/server";
import { confirmPayment } from "@/services/api/payments";

export const dynamic = "force-dynamic";

const VENDORS = new Set(["esewa", "khalti"]);

function searchParamsToRecord(sp: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  sp.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

async function readBodyRecord(req: NextRequest): Promise<Record<string, string>> {
  try {
    const text = await req.text();
    if (!text) return {};
    const first = text.trim()[0];
    if (first === "{") {
      const json = JSON.parse(text) as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(json)
          .filter(([, v]) => typeof v === "string")
          .map(([k, v]) => [k, v as string]),
      );
    }
    return Object.fromEntries(new URLSearchParams(text));
  } catch {
    return {};
  }
}

function decodeBase64Json(raw: string): Record<string, unknown> | null {
  try {
    const padded = raw + "=".repeat((4 - (raw.length % 4)) % 4);
    const decoded = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/** Resolve the internal Payment id from a gateway callback, and a fallback
 *  human status if verification can't run right now (e.g. missing cookie). */
function extractPaymentId(
  vendor: string,
  params: Record<string, string>,
): { paymentId?: string; fallbackStatus?: string } {
  if (vendor === "esewa") {
    const data = decodeBase64Json(params.data || "");
    if (data) {
      const uuid = typeof data.transaction_uuid === "string" ? data.transaction_uuid : undefined;
      const gwStatus = typeof data.status === "string" ? data.status : "";
      return {
        paymentId: uuid,
        fallbackStatus: gwStatus === "COMPLETE" ? "completed" : gwStatus ? "failed" : "unknown",
      };
    }
    return {};
  }

  // khalti
  const orderId = params.purchase_order_id || "";
  const gwStatus = params.status || "";
  const status =
    gwStatus === "Completed"
      ? "completed"
      : ["Canceled", "Cancelled", "Expired", "Failed"].includes(gwStatus)
        ? "cancelled"
        : gwStatus
          ? "pending"
          : "unknown";
  return {
    paymentId: orderId.startsWith("pymt-") ? orderId.slice(5) : orderId || undefined,
    fallbackStatus: status,
  };
}

function mapResult(result: string, storedStatus?: string): string {
  if (result === "already_completed" || result === "COMPLETED") return "completed";
  if (result === "CANCELLED") return "cancelled";
  if (result === "FAILED") return "failed";
  if (result === "PENDING") return "pending";
  if (storedStatus) return storedStatus.toLowerCase();
  return result.toLowerCase();
}

async function handleCallback(req: NextRequest, vendor: string) {
  const query = searchParamsToRecord(req.nextUrl.searchParams);
  const body = await readBodyRecord(req);
  const params = { ...body, ...query };

  const { paymentId, fallbackStatus } = extractPaymentId(vendor, params);
  if (!paymentId) {
    return NextResponse.json(
      { detail: "Could not identify payment from callback" },
      { status: 400 },
    );
  }

  let status = fallbackStatus ?? "unknown";
  let sessionId: string | undefined;
  let ref: string | undefined;
  let amount: string | undefined;
  let method: string | undefined;

  try {
    const result = await confirmPayment(paymentId, params);
    status = mapResult(result.result, result.payment.status);
    sessionId = result.payment.sessionId;
    ref = result.payment.transactionRef || undefined;
    amount = result.payment.amount != null ? String(result.payment.amount) : undefined;
    method = result.payment.method;
  } catch {
    // Verification ran but failed server-side — keep gateway-reported status.
  }

  const redirect = new URL("/book/confirmation", req.nextUrl.origin);
  redirect.searchParams.set("status", status);
  redirect.searchParams.set("paymentId", paymentId);
  if (sessionId) redirect.searchParams.set("sessionId", sessionId);
  if (ref) redirect.searchParams.set("ref", ref);
  if (amount) redirect.searchParams.set("amount", amount);
  if (method) redirect.searchParams.set("method", method);

  return NextResponse.redirect(redirect, { status: 302 });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ vendor: string }> }) {
  const { vendor } = await ctx.params;
  if (!VENDORS.has(vendor)) return NextResponse.json({ detail: "Unknown vendor" }, { status: 404 });
  return handleCallback(req, vendor);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ vendor: string }> }) {
  const { vendor } = await ctx.params;
  if (!VENDORS.has(vendor)) return NextResponse.json({ detail: "Unknown vendor" }, { status: 404 });
  return handleCallback(req, vendor);
}
