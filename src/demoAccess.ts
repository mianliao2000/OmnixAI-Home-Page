export const DEMO_ACCESS_PASSWORD = "10086";
export const DEMO_ACCESS_SESSION_KEY = "omnix.demoAccessGranted";
export const DEMO_ACCESS_COOKIE = "omnix_demo_access";

export function isDemoAccessPasswordValid(value: string): boolean {
  return value === DEMO_ACCESS_PASSWORD;
}

export function hasSharedDemoAccess(cookieHeader: string): boolean {
  return cookieHeader.split(";").some((entry) => entry.trim() === `${DEMO_ACCESS_COOKIE}=true`);
}

export function sharedDemoAccessCookie(hostname: string): string {
  const normalized = hostname.trim().toLowerCase();
  const domain = normalized === "omnixai.biz" || normalized.endsWith(".omnixai.biz")
    ? "; Domain=.omnixai.biz; Secure"
    : "";
  return `${DEMO_ACCESS_COOKIE}=true; Path=/; SameSite=Strict${domain}`;
}

export function demoRouteRequiresAccess(hashRoute: string): boolean {
  const normalized = hashRoute.trim().toLowerCase();
  if (!normalized || normalized === "#/" || normalized === "#/home") return false;
  return normalized !== "#/login";
}
