import { createHash, randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";

// Auth admin: mật khẩu lưu dạng hash trong data/admin.json (đổi được từ /admin).
// Chưa có file thì dùng ADMIN_PASSWORD trong env (bootstrap lần đầu).
// Quên mật khẩu: khôi phục bằng recovery code (sinh ra mỗi lần đổi mật khẩu).
// Mất cả recovery code: xóa data/admin.json trên server → quay về mật khẩu env.

export const ADMIN_COOKIE = "aixray_admin";
const FILE = path.join(process.cwd(), "data", "admin.json");

interface AdminStore {
  passwordHash: string;
  recoveryHash: string | null;
  updatedAt: string;
}

function h(v: string): string {
  return createHash("sha256").update("aixray-admin-v1:" + v).digest("hex");
}

async function readStore(): Promise<AdminStore | null> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as AdminStore;
  } catch {
    return null;
  }
}

async function effectivePasswordHash(): Promise<string | null> {
  const store = await readStore();
  if (store?.passwordHash) return store.passwordHash;
  const env = process.env.ADMIN_PASSWORD;
  return env ? h(env) : null;
}

export async function hasRecoveryCode(): Promise<boolean> {
  const store = await readStore();
  return !!store?.recoveryHash;
}

export async function checkPassword(password: string): Promise<boolean> {
  const cur = await effectivePasswordHash();
  return !!cur && h(password) === cur;
}

export async function checkRecovery(code: string): Promise<boolean> {
  const store = await readStore();
  return !!store?.recoveryHash && h("rec:" + code.trim().toUpperCase()) === store.recoveryHash;
}

// Đặt mật khẩu mới, trả về recovery code MỚI (chỉ hiển thị đúng 1 lần)
export async function setPassword(newPassword: string): Promise<string> {
  const recovery =
    "TAKI-" +
    randomBytes(4).toString("hex").toUpperCase() +
    "-" +
    randomBytes(4).toString("hex").toUpperCase();
  const store: AdminStore = {
    passwordHash: h(newPassword),
    recoveryHash: h("rec:" + recovery),
    updatedAt: new Date().toISOString(),
  };
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(store, null, 2), "utf8");
  return recovery;
}

export async function adminToken(): Promise<string | null> {
  const cur = await effectivePasswordHash();
  return cur ? h("token:" + cur) : null;
}

export async function isAuthed(req: Request): Promise<boolean> {
  const token = await adminToken();
  if (!token) return false;
  const cookie = req.headers.get("cookie") ?? "";
  return cookie
    .split(";")
    .map((c) => c.trim())
    .includes(`${ADMIN_COOKIE}=${token}`);
}

export async function authCookieHeader(): Promise<string> {
  const token = await adminToken();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}${secure}`;
}

export function clearCookieHeader(): string {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
