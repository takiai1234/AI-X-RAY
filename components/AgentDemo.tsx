"use client";

import { useRef, useState } from "react";
import { PERSONAS } from "@/lib/personas";
import type { PersonaId } from "@/lib/types";
import { track } from "@/lib/tracking";

export interface AgentContext {
  score: number;
  level: number;
  levelName: string;
  topTaskLabels: string[];
  painPoint: string;
  scale: string;
  hoursPerWeek: number;
}

// WOW moment (mục 8): khách dùng thử 1 AI Agent, output thật trong 20-60 giây.
// context = kết quả quét để Agent tư vấn bám đúng người dùng.
export default function AgentDemo({
  persona,
  context,
  onDone,
}: {
  persona: PersonaId;
  context: AgentContext | null;
  onDone: () => void;
}) {
  const p = PERSONAS[persona];
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const outRef = useRef<HTMLDivElement>(null);

  const run = async () => {
    if (!input.trim() || running) return;
    setRunning(true);
    setOutput("");
    track("agent_demo_start", { persona });
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: persona, input, context }),
      });
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setOutput(acc);
        outRef.current?.scrollTo({ top: outRef.current.scrollHeight });
      }
      setFinished(true);
      track("agent_demo_complete", { persona });
    } catch {
      setOutput(
        "Có lỗi khi chạy Agent. Bạn thử lại giúp mình nhé, hoặc bấm tiếp tục để nhận lộ trình.",
      );
      setFinished(true);
    } finally {
      setRunning(false);
    }
  };

  // Render markdown đơn giản: heading #, **bold** và xuống dòng
  const html = output
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/^#{1,4}\s+(.+)$/gm, "<strong>$1</strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-8">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-2xl">
            🤖
          </div>
          <div>
            <p className="text-base font-bold text-navy-dark">{p.agent.name}</p>
            <p className="text-xs text-slate-500">
              AI Employee đầu tiên của bạn · tạo sẵn theo hồ sơ {p.label}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600">{p.agent.intro}</p>

        <label className="mt-4 block text-sm font-semibold text-navy-dark">
          {p.agent.inputLabel}
        </label>
        <textarea
          className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none focus:border-navy"
          rows={3}
          placeholder={p.agent.inputPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={running}
        />
        <button
          className="btn-cta mt-3 w-full disabled:opacity-40"
          onClick={run}
          disabled={!input.trim() || running}
        >
          {running ? "⏳ Agent đang làm việc..." : "▶ Chạy Agent"}
        </button>
      </div>

      {output && (
        <div className="card mt-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Kết quả từ {p.agent.name}
            {running && <span className="h-2 w-2 animate-pulse rounded-full bg-cam" />}
          </p>
          <div
            ref={outRef}
            className="agent-output max-h-[420px] overflow-y-auto text-sm leading-relaxed text-slate-700"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}

      {finished && (
        <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
          <div className="mx-auto max-w-2xl">
            <p className="mb-2 text-center text-xs text-slate-500">
              Đây mới là <b>1 Agent đơn lẻ</b>. Hãy xem lộ trình để tự xây cả hệ
              thống Agent + Automation cho riêng bạn.
            </p>
            <button className="btn-cta w-full" onClick={onDone}>
              🗺️ Nhận lộ trình AI 30 ngày của tôi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
