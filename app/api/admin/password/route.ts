import {
  isAuthed,
  checkPassword,
  setPassword,
  authCookieHeader,
} from "@/lib/adminAuth";

// Đổi mật khẩu (phải đăng nhập + nhập đúng mật khẩu hiện tại).
// Trả về recovery code mới — hiển thị đúng 1 lần cho người dùng lưu lại.
export async function POST(req: Request) {
  if (!(await isAuthed(req))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const { currentPassword, newPassword } = (await req
    .json()
    .catch(() => ({}))) as { currentPassword?: string; newPassword?: string };

  if (!currentPassword || !(await checkPassword(currentPassword))) {
    return Response.json(
      { error: "Mật khẩu hiện tại không đúng" },
      { status: 400 },
    );
  }
  if (!newPassword || newPassword.length < 8) {
    return Response.json(
      { error: "Mật khẩu mới cần tối thiểu 8 ký tự" },
      { status: 400 },
    );
  }

  const recoveryCode = await setPassword(newPassword);
  // Token đổi theo mật khẩu → cấp cookie mới luôn để không bị văng ra
  return new Response(JSON.stringify({ ok: true, recoveryCode }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await authCookieHeader(),
    },
  });
}
