import { createHash } from "crypto";

// Auth đơn giản cho trang admin: mật khẩu đặt trong env ADMIN_PASSWORD,
// cookie chứa token = sha256(salt + password). Đủ dùng cho admin 1 người.

export const ADMIN_COOKIE = "aixray_admin";

export function adminToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update("aixray-admin-v1:" + pw).digest("hex");
}

export function checkPassword(password: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  return !!pw && password === pw;
}

export function isAuthed(req: Request): boolean {
  const token = adminToken();
  if (!token) return false;
  const cookie = req.headers.get("cookie") ?? "";
  return cookie
    .split(";")
    .map((c) => c.trim())
    .includes(`${ADMIN_COOKIE}=${token}`);
}

export function authCookieHeader(): string {
  const token = adminToken();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}${secure}`;
}
