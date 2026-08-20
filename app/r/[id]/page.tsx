"use client";

import { use, useEffect, useState } from "react";
import Report from "@/components/Report";
import { computeScore, computeSavings } from "@/lib/scoring";
import type { AssessmentAnswers } from "@/lib/types";

// Trang xem lại báo cáo theo link /r/<id> — gửi qua Zalo để khách quay lại xem.
export default function SavedReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<{ name: string; answers: AssessmentAnswers } | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/report/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setErr("Không tìm thấy báo cáo này. Có thể link đã cũ."));
  }, [id]);

  if (err) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg font-bold text-navy-dark">😕 {err}</p>
        <a href="/" className="btn-cta mt-5 inline-flex">🔍 Quét miễn phí cho bạn</a>
      </div>
    );
  }
  if (!data) {
    return <div className="px-4 py-20 text-center text-sm text-slate-500">Đang tải báo cáo...</div>;
  }

  const score = computeScore(data.answers);
  const savings = computeSavings(
    data.answers,
    data.answers.hourlyRateSelf || 80000,
  );

  return (
    <div>
      <div className="mx-auto max-w-2xl px-4 pt-6 text-center">
        <p className="text-sm text-slate-500">
          Báo cáo AI X-RAY {data.name ? `của ${data.name}` : ""}
        </p>
      </div>
      <Report
        answers={data.answers}
        score={score}
        savings={savings}
        onTryAgent={() => {
          window.location.href = "/";
        }}
      />
    </div>
  );
}
