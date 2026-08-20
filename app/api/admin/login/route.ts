import { checkPassword, authCookieHeader } from "@/lib/adminAuth";

export async function POST(req: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return Response.json(
      { error: "Chưa cấu hình ADMIN_PASSWORD trong .env.local" },
      { status: 500 },
    );
  }
  const { password } = (await req.json().catch(() => ({}))) as {
    password?: string;
  };
  if (!password || !checkPassword(password)) {
    return Response.json({ error: "Sai mật khẩu" }, { status: 401 });
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": authCookieHeader(),
    },
  });
}
