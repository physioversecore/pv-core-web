import "server-only";
import { cookies } from "next/headers";

const TOKEN_KEY = "sahayatri.session";

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_KEY)?.value;
}

export async function setToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_KEY, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function removeToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_KEY);
}
