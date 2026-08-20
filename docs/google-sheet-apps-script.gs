/**
 * AI X-RAY → Google Sheet
 *
 * CÁCH CÀI (5 phút, làm 1 lần):
 * 1. Tạo Google Sheet mới (sheets.new)
 * 2. Menu Tiện ích mở rộng (Extensions) → Apps Script
 * 3. Xóa code mặc định, dán toàn bộ file này vào, bấm Lưu
 * 4. Bấm "Triển khai" (Deploy) → "Tùy chọn triển khai mới" (New deployment)
 *    - Loại: Ứng dụng web (Web app)
 *    - Thực thi với tư cách (Execute as): Tôi (Me)
 *    - Ai có quyền truy cập (Who has access): Bất kỳ ai (Anyone)  ← BẮT BUỘC
 * 5. Bấm Triển khai → Cho phép quyền → copy "URL ứng dụng web" (dạng
 *    https://script.google.com/macros/s/XXXX/exec)
 * 6. Vào https://testai.taki.vn/admin → tab "Dữ liệu" → dán URL đó vào ô
 *    "Google Sheet Webhook URL" → Lưu
 *
 * Mỗi khách để lại thông tin sẽ thành 1 dòng. Khi khách đi tiếp trong phễu
 * (xem roadmap, bấm khóa học), dòng đó tự CẬP NHẬT chứ không tạo dòng mới.
 */

var SHEET_NAME = "Leads";

var HEADERS = [
  "Session ID",
  "Thời gian",
  "Giai đoạn",
  "Tên",
  "SĐT",
  "Email",
  "Nhóm khách",
  "Landing vào",
  "AI Score",
  "AI Level",
  "Lead Score",
  "Mục tiêu",
  "Vấn đề muốn giải quyết",
  "Quy mô",
  "Mức dùng AI",
  "Giờ tiết kiệm/tháng (ước tính)",
  "Cơ hội VND/tháng (ước tính)",
  "Đã chạy demo Agent",
  "Đã bấm xem khóa học",
  "UTM Source",
  "UTM Campaign",
];

var USAGE_LABEL = {
  chua_dung: "Chưa dùng",
  thinh_thoang: "Thỉnh thoảng",
  hang_ngay: "Hàng ngày",
  co_workflow: "Có workflow",
  co_agent: "Có automation/agent",
};

var PERSONA_LABEL = {
  ceo: "CEO / Chủ DN",
  seller: "Nhà bán hàng",
  office: "Dân văn phòng",
  affiliate: "Affiliate",
  marketing: "Marketing",
  sales: "Sales",
  hr: "HR / Kế toán",
  creator: "Creator",
};

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) sh = ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sh.setFrozenRows(1);
    }

    var a = d.answers || {};
    var lead = d.lead || {};
    var behavior = d.behavior || {};
    var utm = (d.utm || {});

    var row = [
      d.session_id || "",
      new Date(),
      d.stage || "",
      lead.name || "",
      "'" + (lead.phone || ""), // giữ số 0 đầu
      lead.email || "",
      PERSONA_LABEL[a.persona] || a.persona || "",
      d.landing || "",
      d.ai_score || "",
      d.ai_level ? d.ai_level + " - " + (d.ai_level_name || "") : "",
      d.lead_score || "",
      a.goal || "",
      a.painPoint || "",
      a.scale || "",
      USAGE_LABEL[a.aiUsageLevel] || a.aiUsageLevel || "",
      d.saved_hours_per_month || "",
      d.opportunity_vnd_per_month || "",
      behavior.demoDone ? "✓" : "",
      behavior.offerClicked ? "✓" : "",
      utm.utm_source || "",
      utm.utm_campaign || "",
    ];

    // Tìm dòng cũ theo session_id để cập nhật thay vì thêm mới
    var last = sh.getLastRow();
    var rowIndex = -1;
    if (last > 1 && d.session_id) {
      var ids = sh.getRange(2, 1, last - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (ids[i][0] === d.session_id) {
          rowIndex = i + 2;
          break;
        }
      }
    }

    if (rowIndex > 0) {
      sh.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    } else {
      sh.appendRow(row);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Mở URL trên trình duyệt để kiểm tra deploy thành công
function doGet() {
  return ContentService.createTextOutput(
    "AI X-RAY Sheet webhook đang hoạt động. Dán URL này vào /admin → tab Dữ liệu.",
  );
}
