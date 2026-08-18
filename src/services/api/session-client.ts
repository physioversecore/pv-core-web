const TOKEN_KEY = "sahayatri.session";

export function setTokenClient(token: string): void {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
}

export function removeTokenClient(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}
