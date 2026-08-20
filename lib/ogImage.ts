import { promises as fs } from "fs";
import path from "path";

// Ảnh og:image (hiện khi share link) — upload từ /admin, lưu trên server.

const DIR = path.join(process.cwd(), "data", "uploads");
const BIN = path.join(DIR, "og-image.bin");
const META = path.join(DIR, "og-image.json");

export const OG_ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export interface OgImageMeta {
  contentType: string;
  size: number;
  updatedAt: string;
}

export async function getOgImageMeta(): Promise<OgImageMeta | null> {
  try {
    return JSON.parse(await fs.readFile(META, "utf8")) as OgImageMeta;
  } catch {
    return null;
  }
}

export async function readOgImage(): Promise<{
  buf: Buffer;
  meta: OgImageMeta;
} | null> {
  const meta = await getOgImageMeta();
  if (!meta) return null;
  try {
    return { buf: await fs.readFile(BIN), meta };
  } catch {
    return null;
  }
}

export async function saveOgImage(
  buf: Buffer,
  contentType: string,
): Promise<OgImageMeta> {
  await fs.mkdir(DIR, { recursive: true });
  const meta: OgImageMeta = {
    contentType,
    size: buf.length,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(BIN, buf);
  await fs.writeFile(META, JSON.stringify(meta, null, 2), "utf8");
  return meta;
}

export async function deleteOgImage(): Promise<void> {
  await fs.rm(BIN, { force: true });
  await fs.rm(META, { force: true });
}

// URL ảnh kèm version để phá cache crawler khi thay ảnh mới
export async function ogImageUrl(): Promise<string | null> {
  const meta = await getOgImageMeta();
  if (!meta) return null;
  return `/og-image?v=${new Date(meta.updatedAt).getTime()}`;
}
