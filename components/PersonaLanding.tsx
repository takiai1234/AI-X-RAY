"use client";

import { PERSONAS } from "@/lib/personas";
import type { PersonaId } from "@/lib/types";

// Sub-brand theo mục 3 của tài liệu (chung một backend, khác thông điệp đầu phễu)
export const SUB_BRAND: Record<PersonaId, string> = {
  ceo: "AI X-RAY Business",
  seller: "AI X-RAY Seller",
  office: "AI X-RAY Office",
  affiliate: "AI X-RAY Affiliate",
  marketing: "AI X-RAY Marketing",
  sales: "AI X-RAY Sales",
  hr: "AI X-RAY HR",
  creator: "AI X-RAY Creator",
};

// Lợi ích đầu phễu viết riêng theo tệp (mục 4 + 21)
const BENEFITS: Record<PersonaId, [string, string][]> = {
  ceo: [
    ["📊", "AI Readiness Score của doanh nghiệp + 5 quy trình quick-win"],
    ["💸", "Số giờ và chi phí cơ hội đang bỏ lỡ, quy ra tiền"],
    ["🤖", "Chạy thử AI Business Advisor phân tích ngay doanh nghiệp của bạn"],
  ],
  seller: [
    ["🛒", "Biết content, chăm khách, vận hành đang thủ công ở đâu"],
    ["✍️", "AI tạo thử hook, content và kịch bản chốt cho đúng sản phẩm của bạn"],
    ["🗺️", "Lộ trình 30 ngày AI hóa cả quy trình bán hàng"],
  ],
  office: [
    ["📈", "Biết chính xác AI thay được bao nhiêu % việc của bạn"],
    ["⏱️", "Số giờ mỗi ngày có thể lấy lại từ Excel, email, slide, báo cáo"],
    ["🤖", "AI Office Assistant xử lý thử ngay 1 task thật của bạn"],
  ],
  affiliate: [
    ["🎯", "AI Affiliate Score + 3 mô hình affiliate hợp với bạn nhất"],
    ["🎬", "AI tìm sản phẩm và viết luôn script video đầu tiên"],
    ["🗺️", "Lộ trình 30 ngày xây dây chuyền affiliate bằng AI"],
  ],
  marketing: [
    ["📊", "Quét mức AI hóa của quy trình marketing bạn đang chạy"],
    ["⚡", "AI Marketing Planner dựng thử khung campaign cho sản phẩm của bạn"],
    ["🗺️", "Lộ trình 30 ngày tăng năng suất bằng AI"],
  ],
  sales: [
    ["📞", "Biết khâu nào trong quy trình sales đang ngốn giờ nhất"],
    ["🎤", "AI Sales Coach luyện thử xử lý từ chối bạn hay gặp"],
    ["🗺️", "Lộ trình 30 ngày xây trợ lý AI cho việc bán hàng"],
  ],
  hr: [
    ["📋", "Quét khối lượng giấy tờ, nhập liệu, tuyển dụng có thể AI hóa"],
    ["🤖", "AI HR Assistant tạo thử JD + scorecard cho vị trí bạn đang tuyển"],
    ["🗺️", "Lộ trình 30 ngày AI hóa quy trình nhân sự và sổ sách"],
  ],
  creator: [
    ["💡", "Biết khâu nào trong sản xuất nội dung đang làm bạn kiệt sức"],
    ["🎬", "AI Viral Creator tạo thử hook + script cho đúng chủ đề kênh của bạn"],
    ["🗺️", "Lộ trình 30 ngày xây dây chuyền nội dung AI"],
  ],
};

export default function PersonaLanding({
  persona,
  onStart,
  hookOverride,
}: {
  persona: PersonaId;
  onStart: () => void;
  hookOverride?: string;
}) {
  const p = PERSONAS[persona];
  const hook = hookOverride || p.hook;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      <header className="pt-10 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cam" />
          {SUB_BRAND[persona]}
        </div>
        <h1 className="text-3xl font-extrabold leading-tight text-navy-dark sm:text-4xl">
          {hook}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">
          Dành riêng cho {p.label}. Quét trong 2 phút, nhận kết quả cá nhân
          hóa ngay, miễn phí.
        </p>
        <button className="btn-cta mt-6 px-10 text-lg" onClick={onStart}>
          🔍 Quét miễn phí trong 2 phút
        </button>
      </header>

      {/* Pain đúng tệp */}
      <div className="card mt-10">
        <h2 className="text-base font-bold text-navy-dark">
          Bạn có thấy mình trong đây không?
        </h2>
        <ul className="mt-3 space-y-2">
          {p.painPoints.map((pain) => (
            <li key={pain} className="flex gap-2 text-sm text-slate-700">
              <span className="text-cam">✔</span> {pain}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm font-medium text-navy">
          Nếu gật đầu từ 2 điều trở lên, bài quét này sinh ra cho bạn.
        </p>
      </div>

      {/* 3 lợi ích theo tệp */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {BENEFITS[persona].map(([icon, text]) => (
          <div key={text} className="card flex items-start gap-3 !p-4">
            <span className="text-2xl">{icon}</span>
            <p className="text-sm font-medium text-slate-700">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button className="btn-cta px-10 text-lg" onClick={onStart}>
          Bắt đầu quét ngay →
        </button>
      </div>

      {/* Social proof - bộ số CHỐT của TAKI */}
      <div className="mt-10 rounded-2xl bg-navy-dark px-6 py-6 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Phát triển bởi TAKI ACADEMY
        </p>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-extrabold text-cam">350.000</p>
            <p className="text-xs text-slate-300">học viên</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-cam">400</p>
            <p className="text-xs text-slate-300">doanh nghiệp đồng hành</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-cam">11 năm</p>
            <p className="text-xs text-slate-300">kinh nghiệm founder</p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Miễn phí, không cần thẻ. Kết quả là ước tính dựa trên thông tin bạn khai
        báo, không phải cam kết.
      </p>
    </div>
  );
}
