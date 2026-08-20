import { readOgImage } from "@/lib/ogImage";

// Serve ảnh og:image cho crawler Facebook/Zalo/TikTok/Google
export async function GET() {
  const img = await readOgImage();
  if (!img) {
    return new Response("Chưa có ảnh share. Upload trong /admin → tab Nội dung.", {
      status: 404,
    });
  }
  return new Response(new Uint8Array(img.buf), {
    headers: {
      "Content-Type": img.meta.contentType,
      // Cache dài + immutable: URL đã có ?v=<updatedAt> ổn định nên đổi ảnh mới
      // sinh URL mới, crawler không cần quét lại ảnh cũ (F-10)
      "Cache-Control": "public, max-age=604800, immutable",
      "Content-Length": String(img.meta.size),
    },
  });
}
