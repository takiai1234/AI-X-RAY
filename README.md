# AI X-RAY — Phần mềm kéo phễu khách hàng cho khóa học AI

MVP triển khai theo tài liệu `AI_XRAY_Phan_Mem_Keo_Pheu_Khach_Hang_Khoa_Hoc_AI.docx` (TAKI ACADEMY).

Công thức phễu: **TRAFFIC → AI AUDIT → PAIN GAP → WOW MOMENT → PERSONALIZED ROADMAP → KHÓA HỌC**

## Tính năng MVP (P1 theo mục 17 của tài liệu)

| Tính năng | Trạng thái | Vị trí code |
|---|---|---|
| AI Assessment (7 câu, branching theo 8 persona) | ✅ | `components/Assessment.tsx`, `lib/personas.ts` |
| AI Score 0-100 + Level 1-10, logic điểm minh bạch | ✅ | `lib/scoring.ts` |
| Time/Money Saving Calculator (ước tính cơ hội) | ✅ | `lib/scoring.ts` → `computeSavings` |
| Personalized AI Roadmap 30 ngày + mapping khóa học | ✅ | `components/Roadmap.tsx` |
| 1 AI Agent Demo / persona (WOW moment, Claude API stream) | ✅ | `app/api/agent/route.ts`, `components/AgentDemo.tsx` |
| Lead Capture + CRM webhook + Lead Scoring (mục 14) | ✅ | `components/LeadGate.tsx`, `app/api/lead/route.ts` |
| Event tracking Phụ lục C (13 event) | ✅ | `lib/tracking.ts`, `app/api/track/route.ts` |
| Share kết quả (giai đoạn 2 — làm sớm vì rẻ) | ✅ | `components/Roadmap.tsx` |
| Landing riêng theo persona (sub-brand mục 3) | ✅ | `app/[persona]/page.tsx`, `components/PersonaLanding.tsx` |

## Landing theo tệp khách (chạy ads theo persona)

Cùng một backend, mỗi tệp một URL — gắn UTM riêng cho từng chiến dịch:

| URL | Sub-brand | Hook |
|---|---|---|
| `/ceo` | AI X-RAY Business | Doanh nghiệp của bạn đang mất bao nhiêu tiền vì chưa AI hóa? |
| `/seller` | AI X-RAY Seller | Bạn đang mất bao nhiêu đơn vì content, chăm khách thủ công? |
| `/office` | AI X-RAY Office | AI có thể thay bạn làm bao nhiêu % công việc? |
| `/affiliate` | AI X-RAY Affiliate | AI Affiliate Score của bạn là bao nhiêu? |
| `/marketing` `/sales` `/hr` `/creator` | AI X-RAY + tệp | Hook riêng từng tệp |

Vào landing tệp thì bước chọn nhóm được bỏ qua, khách vào thẳng assessment. Trang chủ `/` vẫn là landing chung cho traffic organic. Payload lead có thêm trường `landing` để biết khách vào từ URL nào.

## Chạy dự án

```bash
cp .env.example .env.local   # điền ANTHROPIC_API_KEY và CRM_WEBHOOK_URL
npm install
npm run dev                  # http://localhost:3000
```

- **Không có `ANTHROPIC_API_KEY`**: Agent Demo tự chạy bằng output mẫu (fallback) cho từng persona — phễu vẫn demo được đầy đủ.
- **`CRM_WEBHOOK_URL`**: mỗi lead POST về đây (n8n/Lark/CRM). Đồng thời lead luôn được ghi backup vào `data/leads/*.jsonl`.
- **`TRACK_WEBHOOK_URL`**: nhận toàn bộ event phễu; event cũng ghi vào `data/events/*.jsonl` và đẩy `window.dataLayer` cho GTM.

## Payload lead gửi về CRM

```json
{
  "session_id": "s_...",
  "stage": "lead_submit | roadmap_view | offer_click",
  "lead": { "name": "", "phone": "", "email": "", "channel": "zalo" },
  "answers": { "persona": "ceo", "goal": "...", "topTasks": [], "aiUsageLevel": "...", "..." : "..." },
  "ai_score": 37, "ai_level": 3, "ai_level_name": "AI Creator",
  "gaps": ["..."],
  "saved_hours_per_month": 46,
  "opportunity_vnd_per_month": 3680000,
  "lead_score": 87,
  "behavior": { "demoDone": true, "roadmapViewed": true, "offerClicked": false }
}
```

Gợi ý phân luồng theo mục 14: lead 80+ → Sales gọi ngay · 60-79 → remarketing + webinar · 30-50 → nurture Zalo/email.

## Nguyên tắc đã tuân thủ (guardrails TAKI)

- Mọi con số tiết kiệm hiển thị là **ước tính cơ hội**, không phải cam kết; có disclaimer ở mọi màn hình liên quan.
- Không hứa thu nhập; footer khóa học ghi rõ kết quả phụ thuộc hành động người học.
- Không hiển thị giá khóa học (giá cần đối chiếu trước khi công bố) — CTA dẫn về taki.vn + tư vấn.
- Logic AI Score minh bạch, xem được cách tính ngay trên report.
- Bộ số social proof chỉ dùng số đã chốt: 350.000 học viên, 400 doanh nghiệp, 11 năm.
- Nhận diện: Montserrat, navy `#1E40AF`, cam `#F97316`, nền `#F8FAFC`, tối `#1E293B`.

## Deploy

Stack chuẩn TAKI: đẩy lên Vercel, set 3 biến env trong Project Settings. Lưu ý trên Vercel filesystem không bền — backup `data/*.jsonl` chỉ dùng khi self-host; trên Vercel hãy luôn cấu hình `CRM_WEBHOOK_URL`.

## Chưa làm (đúng phạm vi MVP theo mục 17)

- Gamification card ảnh chia sẻ dạng image (hiện là share text + link).
- Marketplace Agent, Community (giai đoạn 3).
- Landing riêng cho từng persona theo UTM (hiện 1 landing chung, đã đọc UTM vào tracking).
