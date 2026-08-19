"use client";

import { useEffect, useState } from "react";

const LINES = [
  "Đang quét cấu trúc công việc của bạn...",
  "Đối chiếu với thư viện use-case AI...",
  "Tính toán thời gian có thể tối ưu...",
  "Chọn AI Agent phù hợp nhất với bạn...",
  "Dựng lộ trình 30 ngày cá nhân hóa...",
];

export default function Analyzing({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => Math.min(i + 1, LINES.length - 1)), 700);
    const done = setTimeout(onDone, 3800);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="relative h-40 w-40 overflow-hidden rounded-2xl border-2 border-navy/20 bg-white">
        <div className="absolute inset-x-2 top-2 h-1 rounded bg-cam scan-line" />
        <div className="flex h-full items-center justify-center text-5xl">🔍</div>
      </div>
      <p className="mt-6 text-base font-semibold text-navy-dark">{LINES[idx]}</p>
      <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-slate-200">
        <div
          className="progress-bar h-full bg-cam"
          style={{ width: `${((idx + 1) / LINES.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
