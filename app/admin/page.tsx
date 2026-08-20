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
};

type Tab = "noidung" | "khoahoc" | "pixel";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [tab, setTab] = useState<Tab>("noidung");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

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
    await load();
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
    setMsg(res.ok ? "✓ Đã lưu. Nội dung áp dụng ngay cho khách mới vào." : "✗ Lưu thất bại, thử lại.");
    setTimeout(() => setMsg(""), 4000);
  };

  if (authed === null) {
    return <Shell><p className="text-sm text-slate-500">Đang tải...</p></Shell>;
  }

  if (!authed) {
    return (
      <Shell>
        <div className="mx-auto max-w-sm">
          <h1 className="text-xl font-bold text-navy-dark">🔐 AI X-RAY Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Nhập mật khẩu quản trị</p>
          <input
            type="password"
            className="mt-4 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none focus:border-navy"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          {loginErr && <p className="mt-2 text-sm font-medium text-red-600">{loginErr}</p>}
          <button className="btn-cta mt-3 w-full" onClick={login}>
            Đăng nhập
          </button>
        </div>
      </Shell>
    );
  }

  if (!settings) return null;
  const s = settings;
  const set = (patch: Partial<Settings>) => setSettings({ ...s, ...patch });

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy-dark">⚙️ AI X-RAY Admin</h1>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm font-medium text-green-700">{msg}</span>}
          <button className="btn-cta !py-2 !px-5 text-sm" onClick={save} disabled={saving}>
            {saving ? "Đang lưu..." : "💾 Lưu thay đổi"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex gap-2 border-b border-slate-200">
        {(
          [
            ["noidung", "📝 Nội dung"],
            ["khoahoc", "🎓 Khóa học"],
            ["pixel", "📡 Pixel & Tracking"],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
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
            Link đăng ký của từng chương trình. Nút CTA trong report sẽ mở đúng
            link này.
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
            hint="GA4 dạng G-XXXXXXX hoặc Google Ads dạng AW-XXXXXXX. Mọi event phễu (assessment_start, lead_submit...) tự bắn vào tag này."
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
            hint="Chỉ nhập dãy số Pixel ID. Tự bắn PageView, Lead (khi khách để SĐT/email) và các event phễu."
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

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 2px solid #e2e8f0;
          padding: 0.65rem 1rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: #1e40af;
        }
      `}</style>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-2xl px-4 py-10">{children}</div>;
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
