export type UserRole = "patient" | "therapist" | "admin";

export const VALID_ROLES: readonly UserRole[] = ["patient", "therapist", "admin"];

export const ROLE_ROUTE: Record<UserRole, string> = {
  patient: "/patient",
  therapist: "/therapist",
  admin: "/admin",
};

export const PUBLIC_PREFIXES = [
  "/access",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
] as const;

export function isPathWithinRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function getRoleForPath(pathname: string): UserRole | null {
  for (const [role, route] of Object.entries(ROLE_ROUTE) as [UserRole, string][]) {
    if (isPathWithinRoute(pathname, route)) return role;
  }
  return null;
}

export function isValidRole(role: unknown): role is UserRole {
  return typeof role === "string" && (VALID_ROLES as readonly string[]).includes(role);
}

// --- Admin sub-roles (email-derived display roles) ---
export type AdminSubRole = "Super Admin" | "Support Admin" | "Finance Admin";

export const TEAM_ROLE_BY_EMAIL: Record<string, Exclude<AdminSubRole, "Super Admin">> = {
  "roshani@sahayatriphysio.com": "Support Admin",
  "bikash@sahayatriphysio.com": "Finance Admin",
};

export function adminRoleForEmail(email: string | undefined | null): AdminSubRole {
  if (!email) return "Super Admin";
  return TEAM_ROLE_BY_EMAIL[email.toLowerCase()] ?? "Super Admin";
}
