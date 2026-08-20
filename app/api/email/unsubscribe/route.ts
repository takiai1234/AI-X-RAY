import { readEmailState, writeEmailState, unsubToken } from "@/lib/email";

// Link hủy đăng ký trong footer mọi email
export async function GET(req: Request) {
  const url = new URL(req.url);
  const e = url.searchParams.get("e") ?? "";
  const t = url.searchParams.get("t") ?? "";

  let email = "";
  try {
    email = Buffer.from(e, "base64url").toString("utf8").toLowerCase();
  } catch {
    /* fallthrough */
  }

  const ok = email && t === unsubToken(email);
  if (ok) {
    const state = await readEmailState();
    state[email] = {
      ...(state[email] ?? { firstSeen: new Date().toISOString(), sent: [] }),
      unsubscribed: true,
    };
    await writeEmailState(state);
  }

  const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>AI X-RAY</title></head>
<body style="font-family:Arial,sans-serif;background:#F8FAFC;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
<div style="background:#fff;border-radius:16px;padding:32px;max-width:420px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.08)">
${
  ok
    ? `<h2 style="color:#1E293B;margin:0 0 8px">✅ Đã hủy đăng ký</h2>
<p style="color:#64748B">Bạn sẽ không nhận thêm email nào từ chuỗi AI X-RAY nữa. Nếu đổi ý, chỉ cần làm lại bài quét tại <a href="/" style="color:#1E40AF">testai.taki.vn</a>.</p>`
    : `<h2 style="color:#1E293B;margin:0 0 8px">Liên kết không hợp lệ</h2>
<p style="color:#64748B">Liên kết hủy đăng ký không đúng hoặc đã cũ.</p>`
}
</div></body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
