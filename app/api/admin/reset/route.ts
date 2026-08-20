import {
  checkRecovery,
  hasRecoveryCode,
  setPassword,
  authCookieHeader,
} from "@/lib/adminAuth";

// Quên mật khẩu: đặt lại bằng recovery code (không cần đăng nhập).
export async function POST(req: Request) {
  const { recoveryCode, newPassword } = (await req
    .json()
    .catch(() => ({}))) as { recoveryCode?: string; newPassword?: string };

  if (!(await hasRecoveryCode())) {
    return Response.json(
      {
        error:
          "Chưa có recovery code (chưa từng đổi mật khẩu trong admin). Cách khôi phục: SSH vào server, sửa ADMIN_PASSWORD trong .env.local rồi chạy: pm2 restart ai-xray --update-env",
      },
      { status: 400 },
    );
  }
  if (!recoveryCode || !(await checkRecovery(recoveryCode))) {
    return Response.json({ error: "Recovery code không đúng" }, { status: 401 });
  }
  if (!newPassword || newPassword.length < 8) {
    return Response.json(
      { error: "Mật khẩu mới cần tối thiểu 8 ký tự" },
      { status: 400 },
    );
  }

  const newRecoveryCode = await setPassword(newPassword);
  return new Response(
    JSON.stringify({ ok: true, recoveryCode: newRecoveryCode }),
    {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await authCookieHeader(),
      },
    },
  );
}
