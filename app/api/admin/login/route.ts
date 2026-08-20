import { checkPassword, authCookieHeader } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as {
    password?: string;
  };
  if (!password || !(await checkPassword(password))) {
    return Response.json({ error: "Sai mật khẩu" }, { status: 401 });
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await authCookieHeader(),
    },
  });
}
