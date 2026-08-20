import { jwtVerify, type JWTPayload } from "jose";
import { isValidRole, type UserRole } from "./auth-constants";

export interface SessionPayload extends JWTPayload {
  sub: string;
  role: UserRole;
}

export type VerifyResult =
  | { ok: true; payload: SessionPayload }
  | { ok: false; reason: "missing" | "expired" | "invalid_signature" | "invalid_role" | "invalid_payload" };

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.SECRET_KEY || "",
);

export async function verifySession(token: string): Promise<VerifyResult> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: "sahayatri-physio",
      audience: "sahayatri-physio",
    });

    const raw = payload as Record<string, unknown>;
    if (!isValidRole(raw.role)) {
      return { ok: false, reason: "invalid_role" };
    }

    return { ok: true, payload: payload as SessionPayload };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (/expired/i.test(msg)) return { ok: false, reason: "expired" };
    if (/signature/i.test(msg)) return { ok: false, reason: "invalid_signature" };
    return { ok: false, reason: "invalid_payload" };
  }
}
