"use client";

import { useEffect, useState } from "react";
import { PERSONAS } from "@/lib/personas";

type Settings = {
  content: { heroTitle: string; heroSubtitle: string };
  personaHooks: Record<string, string>;
  courseUrls: Record<string, string>;
  hourlyRate: number;
  pixels: {
    googleId: string;
    facebookPixelId: string;
    tiktokPixelId: string;
    customHead: string;
  };
  integrations: {
    sheetWebhookUrl: string;
    crmWebhookUrl: string;
  };
};

type LeadRow = {
  session_id?: string;
  stage?: string;
  received_at?: string;
  lead?: { name?: string; phone?: string; email?: string };
  answers?: { persona?: string; goal?: string; painPoint?: string; scale?: string };
  ai_score?: number;
  ai_level?: number;
  lead_score?: number;
  behavior?: { demoDone?: boolean; offerClicked?: boolean };
  landing?: string;
  utm?: Record<string, string>;
};

type Tab = "noidung" | "khoahoc" | "pixel" | "dulieu" | "leads" | "taikhoan";

const PERSONA_SHORT: Record<string, string> = {
  ceo: "CEO",
  seller: "Seller",
  office: "Office",
  affiliate: "Affiliate",
  marketing: "Marketing",
  sales: "Sales",
  hr: "HR",
  creator: "Creator",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [tab, setTab] = useState<Tab>("noidung");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // login / quên mật khẩu
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [password, setPassword] = useState("");
  const [recoveryInput, setRecoveryInput] = useState("");
  const [newPwReset, setNewPwReset] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [recoveryShown, setRecoveryShown] = useState("");

  // tab tài khoản
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  // tab leads
  const [leads, setLeads] = useState<LeadRow[] | null>(null);
  const [leadFilter, setLeadFilter] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/settings");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    setSettings(await res.json());
    setAuthed(true);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (tab === "leads" && authed) {
      fetch("/api/admin/leads?days=90")
        .then((r) => r.json())
        .then((d) => setLeads(d.leads ?? []))
        .catch(() => setLeads([]));
    }
  }, [tab, authed]);

  const login = async () => {
    setLoginErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setLoginErr(d.error ?? "Đăng nhập thất bại");
      return;
    }
    setPassword("");
    await load();
  };

  const resetByRecovery = async () => {
    setLoginErr("");
    const res = await fetch("/api/admin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recoveryCode: recoveryInput, newPassword: newPwReset }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoginErr(d.error ?? "Khôi phục thất bại");
      return;
    }
    setRecoveryShown(d.recoveryCode);
    await load();
  };

  const changePassword = async () => {
    setPwMsg("");
    if (newPw !== newPw2) {
      setPwMsg("✗ Mật khẩu mới nhập lại chưa khớp");
      return;
    }
    const res = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPwMsg("✗ " + (d.error ?? "Đổi mật khẩu thất bại"));
      return;
    }
    setRecoveryShown(d.recoveryCode);
    setCurPw("");
    setNewPw("");
    setNewPw2("");
    setPwMsg("✓ Đã đổi mật khẩu thành công");
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setSettings(null);
    setMode("login");
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setMsg(res.ok ? "✓ Đã lưu. Áp dụng ngay cho khách mới vào." : "✗ Lưu thất bại, thử lại.");
    setTimeout(() => setMsg(""), 4000);
  };

  if (authed === null) {
    return <Shell><p className="text-sm text-slate-500">Đang tải...</p></Shell>;
  }

  // ---------- MÀN ĐĂNG NHẬP / QUÊN MẬT KHẨU ----------
  if (!authed) {
    return (
      <Shell>
        <div className="mx-auto max-w-sm">
          <h1 className="text-xl font-bold text-navy-dark">🔐 AI X-RAY Admin</h1>

          {mode === "login" ? (
            <>
              <p className="mt-1 text-sm text-slate-500">Nhập mật khẩu quản trị</p>
              <input
                type="password"
                className="input mt-4"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
              {loginErr && <p className="mt-2 text-sm font-medium text-red-600">{loginErr}</p>}
              <button className="btn-cta mt-3 w-full" onClick={login}>
                Đăng nhập
              </button>
              <button
                className="mt-3 w-full text-center text-sm text-navy underline"
                onClick={() => {
                  setMode("forgot");
                  setLoginErr("");
                }}
              >
                Quên mật khẩu?
              </button>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-slate-500">
                Khôi phục bằng recovery code (được cấp khi bạn đổi mật khẩu lần
                gần nhất)
              </p>
              <input
                className="input mt-4 font-mono"
                placeholder="TAKI-XXXXXXXX-XXXXXXXX"
                value={recoveryInput}
                onChange={(e) => setRecoveryInput(e.target.value)}
              />
              <input
                type="password"
                className="input mt-2"
                placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
                value={newPwReset}
                onChange={(e) => setNewPwReset(e.target.value)}
              />
              {loginErr && <p className="mt-2 text-sm font-medium text-red-600">{loginErr}</p>}
              <button className="btn-cta mt-3 w-full" onClick={resetByRecovery}>
                Đặt lại mật khẩu
              </button>
              <button
                className="mt-3 w-full text-center text-sm text-navy underline"
                onClick={() => {
                  setMode("login");
                  setLoginErr("");
                }}
              >
                ← Quay lại đăng nhập
              </button>
              <p className="mt-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-500">
                Mất cả recovery code? SSH vào server, xóa file{" "}
                <code>data/admin.json</code> trong thư mục app rồi đăng nhập lại
                bằng mật khẩu trong <code>.env.local</code>.
              </p>
            </>
          )}
        </div>
        <StyleBlock />
      </Shell>
    );
  }

  if (!settings) return null;
  const s = settings;
  const set = (patch: Partial<Settings>) => setSettings({ ...s, ...patch });

  const filteredLeads = (leads ?? []).filter((l) => {
    if (!leadFilter.trim()) return true;
    const q = leadFilter.toLowerCase();
    return [l.lead?.name, l.lead?.phone, l.lead?.email, l.answers?.persona]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  return (
    <Shell wide={tab === "leads"}>
      {/* Recovery code popup */}
      {recoveryShown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
            <p className="text-lg font-bold text-navy-dark">🔑 Recovery code mới của bạn</p>
            <p className="mt-3 select-all rounded-xl bg-navy/5 px-4 py-3 font-mono text-lg font-bold text-navy">
              {recoveryShown}
            </p>
            <p className="mt-3 text-sm text-slate-500">
              LƯU LẠI NGAY (chụp màn hình / ghi chú). Code này chỉ hiển thị 1 lần
              và là cách duy nhất tự khôi phục khi quên mật khẩu.
            </p>
            <button
              className="btn-cta mt-4 w-full"
              onClick={() => {
                navigator.clipboard?.writeText(recoveryShown).catch(() => {});
                setRecoveryShown("");
              }}
            >
              Đã copy & lưu xong
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy-dark">⚙️ AI X-RAY Admin</h1>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm font-medium text-green-700">{msg}</span>}
          {tab !== "leads" && tab !== "taikhoan" && (
            <button className="btn-cta !py-2 !px-5 text-sm" onClick={save} disabled={saving}>
              {saving ? "Đang lưu..." : "💾 Lưu thay đổi"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex flex-wrap gap-1 border-b border-slate-200">
        {(
          [
            ["noidung", "📝 Nội dung"],
            ["khoahoc", "🎓 Khóa học"],
            ["pixel", "📡 Pixel"],
            ["dulieu", "📊 Kết nối"],
            ["leads", "📥 Leads"],
            ["taikhoan", "🔐 Tài khoản"],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-3.5 py-2.5 text-sm font-semibold transition ${
              tab === t
                ? "border-b-2 border-cam bg-white text-navy"
                : "text-slate-500 hover:text-navy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Nội dung */}
      {tab === "noidung" && (
        <div className="mt-5 space-y-5">
          <Field
            label="Tiêu đề trang chủ (hero)"
            hint="Dùng *chữ* để tô màu cam. Ví dụ: Bạn đang bỏ phí *bao nhiêu giờ*..."
          >
            <textarea
              className="input"
              rows={2}
              value={s.content.heroTitle}
              onChange={(e) => set({ content: { ...s.content, heroTitle: e.target.value } })}
            />
          </Field>
          <Field label="Mô tả dưới tiêu đề">
            <textarea
              className="input"
              rows={3}
              value={s.content.heroSubtitle}
              onChange={(e) => set({ content: { ...s.content, heroSubtitle: e.target.value } })}
            />
          </Field>
          <Field
            label="Đơn giá quy đổi (đ/giờ)"
            hint="Dùng cho phần tính tiền cơ hội trong report. Mặc định 80.000đ/giờ."
          >
            <input
              className="input"
              type="number"
              value={s.hourlyRate}
              onChange={(e) => set({ hourlyRate: Number(e.target.value) })}
            />
          </Field>
          <div>
            <h3 className="mb-2 text-sm font-bold text-navy-dark">
              Hook đầu phễu theo tệp (hiện trên landing /ceo, /seller...)
            </h3>
            <div className="space-y-3">
              {Object.values(PERSONAS).map((p) => (
                <Field key={p.id} label={`${p.label} (/${p.id})`}>
                  <input
                    className="input"
                    value={s.personaHooks[p.id] ?? ""}
                    onChange={(e) =>
                      set({ personaHooks: { ...s.personaHooks, [p.id]: e.target.value } })
                    }
                  />
                </Field>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Khóa học */}
      {tab === "khoahoc" && (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-slate-500">
            Link đăng ký của từng chương trình. Nút CTA trong report sẽ mở đúng link này.
          </p>
          {Object.entries(s.courseUrls).map(([name, url]) => (
            <Field key={name} label={name}>
              <input
                className="input"
                value={url}
                onChange={(e) =>
                  set({ courseUrls: { ...s.courseUrls, [name]: e.target.value } })
                }
              />
            </Field>
          ))}
        </div>
      )}

      {/* Tab Pixel */}
      {tab === "pixel" && (
        <div className="mt-5 space-y-5">
          <Field
            label="Google Tag ID"
            hint="GA4 dạng G-XXXXXXX hoặc Google Ads dạng AW-XXXXXXX. Mọi event phễu tự bắn vào tag này."
          >
            <input
              className="input"
              placeholder="G-XXXXXXXXXX"
              value={s.pixels.googleId}
              onChange={(e) => set({ pixels: { ...s.pixels, googleId: e.target.value.trim() } })}
            />
          </Field>
          <Field
            label="Facebook Pixel ID"
            hint="Chỉ nhập dãy số Pixel ID. Tự bắn PageView, Lead và các event phễu."
          >
            <input
              className="input"
              placeholder="123456789012345"
              value={s.pixels.facebookPixelId}
              onChange={(e) =>
                set({ pixels: { ...s.pixels, facebookPixelId: e.target.value.trim() } })
              }
            />
          </Field>
          <Field
            label="TikTok Pixel ID"
            hint="Tự bắn PageView, SubmitForm (khi có lead) và ClickButton (khi bấm xem khóa học)."
          >
            <input
              className="input"
              placeholder="XXXXXXXXXXXXXXXXXX"
              value={s.pixels.tiktokPixelId}
              onChange={(e) =>
                set({ pixels: { ...s.pixels, tiktokPixelId: e.target.value.trim() } })
              }
            />
          </Field>
          <Field
            label="Mã nhúng tùy chỉnh (nâng cao)"
            hint="Dán nguyên đoạn script bất kỳ (GTM, pixel khác...). Sẽ được chèn vào mọi trang."
          >
            <textarea
              className="input font-mono text-xs"
              rows={6}
              placeholder="<script>...</script>"
              value={s.pixels.customHead}
              onChange={(e) => set({ pixels: { ...s.pixels, customHead: e.target.value } })}
            />
          </Field>
        </div>
      )}

      {/* Tab Kết nối dữ liệu */}
      {tab === "dulieu" && (
        <div className="mt-5 space-y-5">
          <div className="rounded-xl bg-navy/5 p-4 text-sm text-slate-700">
            <p className="font-bold text-navy-dark">Dữ liệu lead đang được lưu ở đâu?</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <b>Trên server</b> (luôn bật): xem trực tiếp ở tab <b>📥 Leads</b> — kể cả khi
                Google Sheet lỗi kết nối, lead vẫn nằm đây, không mất.
              </li>
              <li><b>Google Sheet</b>: điền URL bên dưới, mỗi lead thành 1 dòng.</li>
              <li><b>CRM/n8n/Lark</b>: điền webhook để nhận lead realtime.</li>
            </ul>
          </div>

          <Field
            label="Google Sheet Webhook URL"
            hint="Cách lấy: tạo Google Sheet → Tiện ích mở rộng → Apps Script → dán script trong file docs/google-sheet-apps-script.gs (repo GitHub) → Triển khai dạng Ứng dụng web (quyền: Bất kỳ ai) → copy URL /exec dán vào đây."
          >
            <input
              className="input"
              placeholder="https://script.google.com/macros/s/XXXX/exec"
              value={s.integrations.sheetWebhookUrl}
              onChange={(e) =>
                set({
                  integrations: { ...s.integrations, sheetWebhookUrl: e.target.value.trim() },
                })
              }
            />
          </Field>

          <Field
            label="CRM Webhook URL (n8n / Lark / CRM khác)"
            hint="Mỗi lead sẽ POST JSON đầy đủ (hồ sơ + AI Score + lead score + behavior) về URL này."
          >
            <input
              className="input"
              placeholder="https://n8n.taki.vn/webhook/..."
              value={s.integrations.crmWebhookUrl}
              onChange={(e) =>
                set({
                  integrations: { ...s.integrations, crmWebhookUrl: e.target.value.trim() },
                })
              }
            />
          </Field>

          <button
            className="btn-ghost w-full"
            onClick={async () => {
              const res = await fetch("/api/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  session_id: "s_test_admin_" + Date.now(),
                  stage: "test_tu_admin",
                  lead: { name: "Lead Test từ Admin", phone: "0900000000", email: "test@taki.vn" },
                  answers: { persona: "ceo", goal: "Kiểm tra kết nối", painPoint: "—", scale: "—", aiUsageLevel: "hang_ngay" },
                  ai_score: 50, ai_level: 5, ai_level_name: "AI Marketer", lead_score: 50,
                  behavior: { demoDone: true, roadmapViewed: true, offerClicked: false },
                  landing: "/admin-test",
                  utm: { utm_source: "admin_test" },
                }),
              });
              alert(res.ok ? "Đã gửi lead test! Kiểm tra Google Sheet / CRM / tab Leads. (Nhớ bấm Lưu thay đổi trước khi test)" : "Gửi thất bại");
            }}
          >
            🧪 Gửi 1 lead test để kiểm tra kết nối
          </button>
        </div>
      )}

      {/* Tab Leads */}
      {tab === "leads" && (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input
              className="input !w-64"
              placeholder="🔍 Tìm theo tên / SĐT / email..."
              value={leadFilter}
              onChange={(e) => setLeadFilter(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">
                {leads === null ? "Đang tải..." : `${filteredLeads.length} lead (90 ngày)`}
              </span>
              <a className="btn-cta !py-2 !px-4 text-sm" href="/api/admin/leads?days=365&format=csv">
                ⬇️ Tải CSV (Excel)
              </a>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">Thời gian</th>
                  <th className="px-3 py-2.5">Tên</th>
                  <th className="px-3 py-2.5">SĐT</th>
                  <th className="px-3 py-2.5">Nhóm</th>
                  <th className="px-3 py-2.5 text-right">AI Score</th>
                  <th className="px-3 py-2.5 text-right">Lead Score</th>
                  <th className="px-3 py-2.5">Hành trình</th>
                  <th className="px-3 py-2.5">Nguồn</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((l, i) => (
                  <tr key={l.session_id ?? i} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                      {l.received_at ? new Date(l.received_at).toLocaleString("vi-VN") : ""}
                    </td>
                    <td className="px-3 py-2 font-medium text-navy-dark">{l.lead?.name || "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {l.lead?.phone || l.lead?.email || "—"}
                    </td>
                    <td className="px-3 py-2">{PERSONA_SHORT[l.answers?.persona ?? ""] ?? "—"}</td>
                    <td className="px-3 py-2 text-right">{l.ai_score ?? "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          (l.lead_score ?? 0) >= 80
                            ? "bg-red-100 text-red-700"
                            : (l.lead_score ?? 0) >= 60
                              ? "bg-cam/15 text-cam-dark"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {l.lead_score ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {l.behavior?.demoDone ? "✓ demo " : ""}
                      {l.behavior?.offerClicked ? "✓ bấm khóa" : ""}
                      {!l.behavior?.demoDone && !l.behavior?.offerClicked ? l.stage : ""}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {l.landing ?? ""} {l.utm?.utm_source ? `· ${l.utm.utm_source}` : ""}
                    </td>
                  </tr>
                ))}
                {leads !== null && filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-sm text-slate-400">
                      Chưa có lead nào trong 90 ngày qua
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Lead score 80+ (đỏ): ưu tiên Sales gọi ngay · 60-79 (cam): remarketing/webinar · dưới 60: nurture.
            Nguồn dữ liệu: backup trên server, độc lập với Google Sheet.
          </p>
        </div>
      )}

      {/* Tab Tài khoản */}
      {tab === "taikhoan" && (
        <div className="mt-5 max-w-md space-y-5">
          <div>
            <h3 className="text-base font-bold text-navy-dark">Đổi mật khẩu</h3>
            <p className="mt-1 text-xs text-slate-400">
              Sau khi đổi, hệ thống cấp recovery code mới — lưu lại để dùng khi quên mật khẩu.
            </p>
            <input
              type="password"
              className="input mt-3"
              placeholder="Mật khẩu hiện tại"
              value={curPw}
              onChange={(e) => setCurPw(e.target.value)}
            />
            <input
              type="password"
              className="input mt-2"
              placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
            <input
              type="password"
              className="input mt-2"
              placeholder="Nhập lại mật khẩu mới"
              value={newPw2}
              onChange={(e) => setNewPw2(e.target.value)}
            />
            {pwMsg && (
              <p className={`mt-2 text-sm font-medium ${pwMsg.startsWith("✓") ? "text-green-700" : "text-red-600"}`}>
                {pwMsg}
              </p>
            )}
            <button className="btn-cta mt-3 w-full" onClick={changePassword}>
              Đổi mật khẩu
            </button>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <button className="btn-ghost w-full" onClick={logout}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      )}

      <StyleBlock />
    </Shell>
  );
}

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto ${wide ? "max-w-5xl" : "max-w-2xl"} px-4 py-10`}>{children}</div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-navy-dark">{label}</label>
      {hint && <p className="mb-1.5 text-xs text-slate-400">{hint}</p>}
      {children}
    </div>
  );
}

function StyleBlock() {
  return (
    <style jsx global>{`
      .input {
        width: 100%;
        border-radius: 0.75rem;
        border: 2px solid #e2e8f0;
        padding: 0.65rem 1rem;
        font-size: 0.875rem;
        outline: none;
        background: #fff;
      }
      .input:focus {
        border-color: #1e40af;
      }
    `}</style>
  );
}
