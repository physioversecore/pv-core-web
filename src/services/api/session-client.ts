const TOKEN_KEY = "sahayatri.session";

export function removeTokenClient(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}
