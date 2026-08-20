"use client";

import { useState } from "react";
import type { AssessmentAnswers, ScoreResult, SavingsResult } from "@/lib/types";
import { PERSONAS } from "@/lib/personas";
import { AI_LEVELS, formatVnd } from "@/lib/scoring";

const GROUP_LABEL: Record<string, string> = {
  quick_win: "⚡ Quick Win",
  chuan_hoa_du_lieu: "🗂️ Cần chuẩn hóa dữ liệu",
  agent_automation: "🤖 Cần Agent / Automation",
};

// Màn hình kết quả: biến "nỗi đau" thành con số (mục 7)
export default function Report({
  answers,
  score,
  savings,
  onTryAgent,
}: {
  answers: AssessmentAnswers;
  score: ScoreResult;
  savings: SavingsResult;
  onTryAgent: () => void;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const persona = PERSONAS[answers.persona ?? "office"];

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-8">
      {/* Score header */}
      <div className="card text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          AI Readiness Score · {persona.label}
        </p>
        <div className="mx-auto mt-3 flex h-32 w-32 items-center justify-center rounded-full border-8 border-cam bg-white">
          <div>
            <p className="text-4xl font-extrabold text-navy">{score.score}</p>
            <p className="text-xs text-slate-400">/100</p>
          </div>
        </div>
        <p className="mt-3 text-lg font-bold text-navy-dark">
          Level {score.level}/10 — {score.levelName}
        </p>
        <p className="text-sm text-slate-500">{AI_LEVELS[score.level - 1].desc}</p>

        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="mt-3 text-xs font-semibold text-navy underline"
        >
          {showBreakdown ? "Ẩn cách tính điểm" : "Xem cách tính điểm"}
        </button>
        {showBreakdown && (
          <div className="mt-3 space-y-2 text-left">
            {score.breakdown.map((b) => (
              <div key={b.label} className="text-xs">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>{b.label}</span>
                  <span>
                    {b.points}/{b.max}
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-navy"
                    style={{ width: `${(b.points / b.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Điểm mạnh */}
      <Section title="✅ Điểm mạnh hiện tại">
        <ul className="space-y-2">
          {score.strengths.map((s) => (
            <li key={s} className="flex gap-2 text-sm text-slate-700">
              <span className="text-green-600">●</span> {s}
            </li>
          ))}
        </ul>
      </Section>

      {/* Khoảng trống */}
      <Section title="🔻 Khoảng trống đang khiến bạn chậm lại">
        <ul className="space-y-2">
          {score.gaps.map((g) => (
            <li key={g} className="flex gap-2 text-sm text-slate-700">
              <span className="text-cam">●</span> {g}
            </li>
          ))}
        </ul>
      </Section>

      {/* Bảng quy đổi thời gian */}
      <Section
        title={`⏱️ AI phát hiện ${savings.rows.length} nhóm việc của bạn có thể AI hóa`}
      >
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Công việc</th>
                <th className="px-2 py-2 text-right">Hiện tại</th>
                <th className="px-2 py-2 text-right">Sau AI</th>
                <th className="px-3 py-2 text-right">Tiết kiệm</th>
              </tr>
            </thead>
            <tbody>
              {savings.rows.map((r) => (
                <tr key={r.task} className="border-t border-slate-100">
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-navy-dark">{r.task}</p>
                    <p className="text-[11px] text-slate-400">{GROUP_LABEL[r.group]}</p>
                  </td>
                  <td className="px-2 py-2.5 text-right text-slate-500">
                    {r.currentHours}h/th
                  </td>
                  <td className="px-2 py-2.5 text-right text-slate-500">
                    {r.afterHours}h
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-cam">
                    {r.savedHours}h
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-navy/20 bg-navy/5 font-bold">
                <td className="px-3 py-2.5 text-navy-dark">TỔNG</td>
                <td className="px-2 py-2.5 text-right">{savings.totalCurrentHours}h</td>
                <td className="px-2 py-2.5 text-right">
                  {savings.totalCurrentHours - savings.totalSavedHours}h
                </td>
                <td className="px-3 py-2.5 text-right text-cam">
                  {savings.totalSavedHours}h
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-xl bg-navy p-4 text-white">
          <p className="text-sm">
            AI có thể hỗ trợ khoảng{" "}
            <b className="text-cam">{savings.aiSupportPct}%</b> khối lượng các
            việc trên, tương đương{" "}
            <b className="text-cam">{savings.totalSavedHours} giờ/tháng</b>.
          </p>
          <p className="mt-1 text-sm">
            Quy đổi theo chi phí giờ công {formatVnd(savings.hourlyRate)}/giờ{" "}
            <b>theo mức bạn khai báo</b>, đây là khoảng{" "}
            <b className="text-cam">{formatVnd(savings.moneyPerMonth)}/tháng</b>{" "}
            — nhưng đây mới chỉ là <b>thời gian và tiền bạc quy trực tiếp</b>.
          </p>

          <div className="mt-3 rounded-xl border border-cam/40 bg-white/10 p-3">
            <p className="text-sm font-bold text-cam">
              ⚠️ Chưa tính chi phí cơ hội gián tiếp — phần thường lớn hơn nhiều
            </p>
            <p className="mt-1 text-sm text-slate-100">{persona.opportunityNote}</p>
          </div>

          <p className="mt-2 text-[11px] text-slate-300">
            * Các con số là ước tính cơ hội dựa trên khai báo của bạn và tỷ lệ
            hỗ trợ minh họa theo từng loại việc — không phải cam kết tiết kiệm
            hay doanh thu.
          </p>
        </div>
      </Section>

      {/* CTA sang WOW moment */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <button className="btn-cta w-full" onClick={onTryAgent}>
            🤖 Tôi đã tạo sẵn {persona.agent.name} cho bạn — Chạy thử ngay
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card mt-4">
      <h3 className="mb-3 text-base font-bold text-navy-dark">{title}</h3>
      {children}
    </div>
  );
}
