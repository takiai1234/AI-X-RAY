import type { PersonaDef } from "./types";

const AGENT_BASE_RULES = `Bạn trả lời bằng tiếng Việt, văn phong công việc, đi thẳng vào việc, có cấu trúc rõ ràng với tiêu đề ngắn.
Quy tắc bắt buộc:
- Không hứa hẹn thu nhập hoặc kết quả cụ thể. Mọi con số đưa ra là ước tính minh họa và phải ghi rõ như vậy.
- Không sáo rỗng, không dùng cụm "trong thời đại 4.0", "chưa bao giờ dễ dàng đến thế".
- Nếu có KẾT QUẢ QUÉT của người dùng kèm theo, PHẢI mở đầu bằng mục "PHÂN TÍCH TỪ KẾT QUẢ QUÉT CỦA BẠN": nhận xét AI Score, gọi tên đúng các việc tốn giờ nhất và vấn đề họ ưu tiên, rồi mới vào nội dung chính.
- Mỗi đề xuất phải cụ thể đến mức làm được ngay: nêu rõ làm gì, bằng công cụ loại nào, mất khoảng bao lâu, ví dụ mẫu nếu phù hợp.
- BẮT BUỘC có mục "CHI PHÍ CƠ HỘI BẠN ĐANG MẤT MỖI THÁNG": không chỉ tính giờ tiết kiệm, mà so sánh SẢN LƯỢNG hiện tại với sản lượng khi ứng dụng AI trên chính công việc của người dùng (ví dụ: 1 người làm content thủ công chỉ ra 2-3 bài/ngày, có AI có thể ra 20-30 bài chất lượng; thay vì tiếp cận vài trăm - vài nghìn người thì có thể tiếp cận hàng trăm nghìn người). Từ chênh lệch sản lượng đó, quy ra tệp tiếp cận / số khách / doanh thu tiềm năng đang bỏ lỡ, dùng dải số thận trọng và LUÔN ghi rõ là "ước tính minh họa, không phải cam kết".
- Sau nội dung chính, LUÔN kết thúc bằng 2 phần: "VIỆC LÀM NGAY TRONG 7 NGÀY" (checklist chia theo ngày, bám đúng tình huống người dùng) và "3 LỖI THƯỜNG GẶP CẦN TRÁNH" (mỗi lỗi kèm cách né).
- Độ dài mục tiêu 800-1200 từ. Dùng gạch đầu dòng, không dùng bảng markdown phức tạp.
- Kết thúc bằng 1-2 câu gợi ý bước tiếp theo nên học/xây gì để tự triển khai toàn hệ thống (không nêu tên khóa học, không nêu giá).`;

export const PERSONAS: Record<string, PersonaDef> = {
  ceo: {
    id: "ceo",
    label: "CEO / Chủ doanh nghiệp",
    hook: "Doanh nghiệp của bạn đang mất bao nhiêu tiền vì chưa AI hóa?",
    taskLibrary: [
      { id: "content", label: "Viết content marketing", aiSupportPct: 80, group: "quick_win" },
      { id: "report", label: "Báo cáo nội bộ", aiSupportPct: 85, group: "quick_win" },
      { id: "cskh", label: "Chăm sóc khách hàng", aiSupportPct: 70, group: "agent_automation" },
      { id: "ads", label: "Phân tích quảng cáo", aiSupportPct: 85, group: "chuan_hoa_du_lieu" },
      { id: "training", label: "Đào tạo nhân sự / sales", aiSupportPct: 75, group: "chuan_hoa_du_lieu" },
      { id: "meeting", label: "Họp + biên bản + giao việc", aiSupportPct: 85, group: "quick_win" },
      { id: "process", label: "Quy trình vận hành thủ công", aiSupportPct: 60, group: "agent_automation" },
      { id: "recruit", label: "Tuyển dụng, lọc CV", aiSupportPct: 70, group: "quick_win" },
    ],
    goals: ["Tăng doanh thu", "Giảm chi phí vận hành", "Giảm phụ thuộc nhân sự", "Có thời gian làm chiến lược"],
    painPoints: [
      "Chi phí nhân sự cao, vận hành thủ công",
      "Không biết bắt đầu AI hóa từ đâu",
      "Content và marketing phụ thuộc vài người",
      "Phải nhắc việc từng nhân sự",
      "Mọi việc quan trọng đều phải qua tay mình",
      "Nhân sự ngại thay đổi, khó đưa công nghệ mới vào",
    ],
    scaleQuestion: {
      label: "Quy mô doanh nghiệp của anh/chị?",
      options: ["Dưới 5 nhân sự", "5-10 nhân sự", "11-30 nhân sự", "Trên 30 nhân sự"],
    },
    agent: {
      name: "AI Business Advisor",
      intro: "Tôi đã tạo sẵn AI Business Advisor đầu tiên cho anh/chị. Nhập ngành hàng và tình hình kinh doanh, Agent sẽ phân tích ngay.",
      inputLabel: "Mô tả ngắn về doanh nghiệp (ngành, doanh thu ước tính, đội ngũ, mục tiêu)",
      inputPlaceholder: "Ví dụ: Tôi bán mỹ phẩm online, doanh thu khoảng 3 tỷ/tháng, team 12 người, muốn giảm chi phí vận hành",
      systemPrompt: `Bạn là AI Business Advisor cho chủ doanh nghiệp Việt Nam. Từ mô tả doanh nghiệp của người dùng, hãy trả về đúng cấu trúc:
1. BA NÚT THẮT LỚN NHẤT: 3 điểm nghẽn vận hành/tăng trưởng suy ra từ mô tả.
2. NĂM CƠ HỘI AI HÓA: 5 quy trình cụ thể có thể ứng dụng AI, mỗi cơ hội ghi rõ công việc hiện tại, cách AI làm thay, mức tiết kiệm thời gian ước tính (ghi rõ là ước tính).
3. KẾ HOẠCH 30 NGÀY: tuần 1 đến tuần 4, mỗi tuần 2-3 việc cụ thể.
${AGENT_BASE_RULES}`,
      fallbackOutput: `**BA NÚT THẮT LỚN NHẤT**
- Vận hành phụ thuộc con người: các việc lặp lại như báo cáo, content, chăm khách vẫn làm tay, tốn giờ công của cả đội.
- Dữ liệu phân tán: số liệu bán hàng, quảng cáo, khách hàng nằm rải rác nên ra quyết định chậm.
- Chủ doanh nghiệp ôm việc: thời gian dành cho chiến lược bị việc vận hành lấn hết.

**NĂM CƠ HỘI AI HÓA (ước tính minh họa)**
- Content marketing: AI viết nháp bài, kịch bản, ảnh minh họa. Tiết kiệm khoảng 70-80% thời gian viết.
- Báo cáo nội bộ: AI tổng hợp số liệu thành báo cáo tuần tự động. Tiết kiệm khoảng 80% thời gian làm báo cáo.
- Chăm sóc khách hàng: AI trả lời câu hỏi lặp lại, phân loại hội thoại, nhắc lịch. Giảm khoảng 60-70% khối lượng trả lời thủ công.
- Họp và giao việc: AI ghi biên bản, tách đầu việc, nhắc deadline. Tiết kiệm khoảng 80% thời gian hậu cần cuộc họp.
- Phân tích quảng cáo: AI đọc số liệu ads, chỉ ra nhóm quảng cáo lãng phí. Tiết kiệm khoảng 80% thời gian phân tích tay.

**KẾ HOẠCH 30 NGÀY**
- Tuần 1: chọn 1 việc tốn giờ nhất, dựng prompt chuẩn cho việc đó, đo thời gian trước và sau.
- Tuần 2: nhân bản cách làm sang 2 việc tiếp theo, viết thành quy trình cho nhân sự dùng chung.
- Tuần 3: kết nối 1 luồng tự động hóa đầu tiên (ví dụ form khách hàng đổ về nơi AI xử lý và trả lời nháp).
- Tuần 4: dựng 1 AI Agent theo vai trò (ví dụ trợ lý marketing) và đo kết quả cả tháng.

**CHI PHÍ CƠ HỘI BẠN ĐANG MẤT MỖI THÁNG**
Tiền mất lớn nhất không nằm ở số giờ, mà ở sản lượng doanh nghiệp KHÔNG tạo ra được:
- Content: 1 nhân sự thủ công chỉ ra 2-3 bài/ngày. Cùng người đó có AI có thể ra 20-30 bài chất lượng — thay vì tiếp cận vài trăm, vài nghìn người, doanh nghiệp có thể tiếp cận hàng trăm nghìn người mỗi tháng. Mỗi 100.000 lượt tiếp cận thêm, chỉ cần 0,1% thành đơn đã là 100 đơn — với giá trị đơn trung bình vài trăm nghìn, doanh thu đang bỏ lỡ có thể lên tới hàng chục, thậm chí hàng trăm triệu/tháng (ước tính minh họa, không phải cam kết).
- Chăm khách: inbox ngoài giờ không ai trả lời trong 5-10 phút đầu là khách nguội — mỗi khách rơi là mất trọn giá trị vòng đời của khách đó, không chỉ một đơn.
- Tốc độ quyết định: báo cáo chậm 1 tuần nghĩa là quảng cáo lãng phí chạy thêm 1 tuần trước khi bị cắt.

**VIỆC LÀM NGAY TRONG 7 NGÀY**
- Ngày 1-2: chọn đúng 1 việc lặp lại tốn giờ nhất (thường là báo cáo hoặc content), tự tay dùng AI làm trọn vẹn 1 lần, bấm giờ so sánh trước - sau.
- Ngày 3-4: viết cách làm đó thành 1 prompt chuẩn có chỗ điền thông tin, đưa cho 1 nhân sự dùng thử và thu phản hồi.
- Ngày 5: họp 30 phút với trưởng các bộ phận, mỗi người liệt kê 3 việc lặp lại nhiều nhất của bộ phận mình.
- Ngày 6-7: chấm danh sách đó theo 2 tiêu chí (tốn giờ, dễ AI hóa), chốt 3 việc sẽ AI hóa trong tháng đầu, giao người phụ trách từng việc.

**3 LỖI CHỦ DOANH NGHIỆP THƯỜNG GẶP KHI AI HÓA**
- Mua công cụ trước khi chuẩn hóa quy trình: tool về không ai dùng vì việc chưa được mô tả rõ. Cách né: viết quy trình 1 trang trước, chọn tool sau.
- Giao hết cho một bạn "trẻ, rành công nghệ": bạn ấy không có quyền sửa quy trình nên mọi thứ dừng ở thử nghiệm. Cách né: chủ doanh nghiệp phải tự tay làm thắng lợi đầu tiên.
- Muốn AI hóa tất cả cùng lúc: đội ngũ quá tải rồi quay về cách cũ. Cách né: thắng 1 việc nhỏ trong 2 tuần để cả đội tin, rồi mới nhân rộng.

Đây mới là một Agent đơn lẻ. Khi anh/chị tự xây được hệ thống Agent và Automation cho từng phòng ban, mức hiệu quả sẽ lớn hơn nhiều — bước tiếp theo nên học cách tự thiết kế quy trình AI hóa cho chính doanh nghiệp mình.`,
    },
    courses: [
      { name: "AI Business System", reason: "Khóa 3 ngày xây hệ thống marketing-sales tự động 24/7 và trợ lý AI cho doanh nghiệp — khớp thẳng các quy trình vừa chẩn đoán." },
      { name: "AI Scale Up Coaching", reason: "Đồng hành 1-1 để triển khai Agent và Automation vào đúng quy trình của doanh nghiệp bạn." },
      { name: "AI Super Power", reason: "6 buổi tối nắm nền tảng tư duy và công cụ AI trước khi hệ thống hóa cả doanh nghiệp." },
    ],
    roadmapPhases: [
      "Prompt chuẩn cho việc cá nhân của CEO",
      "AI hóa content và báo cáo cho team",
      "Chuẩn hóa dữ liệu khách hàng và quy trình",
      "Automation luồng lặp lại đầu tiên",
      "AI Agent theo phòng ban",
    ],
  },

  seller: {
    id: "seller",
    label: "Nhà bán hàng / Ecommerce",
    hook: "Bạn đang mất bao nhiêu đơn vì content, chăm khách và vận hành vẫn làm thủ công?",
    taskLibrary: [
      { id: "content", label: "Viết content bán hàng", aiSupportPct: 85, group: "quick_win" },
      { id: "video", label: "Làm video sản phẩm", aiSupportPct: 70, group: "quick_win" },
      { id: "cskh", label: "Trả lời inbox / chăm khách", aiSupportPct: 75, group: "agent_automation" },
      { id: "chot", label: "Kịch bản chốt sale, xử lý từ chối", aiSupportPct: 70, group: "quick_win" },
      { id: "ads", label: "Viết và phân tích quảng cáo", aiSupportPct: 80, group: "chuan_hoa_du_lieu" },
      { id: "don", label: "Xử lý đơn, đối soát", aiSupportPct: 60, group: "agent_automation" },
      { id: "livestream", label: "Chuẩn bị livestream", aiSupportPct: 65, group: "quick_win" },
    ],
    goals: ["Tăng đơn hàng", "Giảm thời gian làm content", "Tự động chăm khách", "Mở rộng kênh bán"],
    painPoints: [
      "Thiếu traffic, content tốn quá nhiều thời gian",
      "Inbox nhiều nhưng chốt được ít",
      "Chăm khách và vận hành thủ công",
      "Không kịp làm video đều đặn",
      "Đối thủ bán nhanh hơn, giá cạnh tranh hơn",
      "Quảng cáo tốn tiền mà đơn không ổn định",
    ],
    scaleQuestion: {
      label: "Quy mô bán hàng hiện tại?",
      options: ["Mới bắt đầu", "Dưới 100 đơn/tháng", "100-500 đơn/tháng", "Trên 500 đơn/tháng"],
    },
    agent: {
      name: "AI Sales & Content Manager",
      intro: "Tôi đã tạo sẵn AI Sales & Content Manager cho bạn. Nhập sản phẩm đang bán, Agent sẽ tạo bộ content và kịch bản chốt ngay.",
      inputLabel: "Sản phẩm đang bán (tên, giá, kênh bán chính)",
      inputPlaceholder: "Ví dụ: Serum dưỡng da 350k, bán chủ yếu trên TikTok Shop và Facebook",
      systemPrompt: `Bạn là AI Sales & Content Manager cho nhà bán hàng Việt Nam. Từ thông tin sản phẩm của người dùng, hãy trả về đúng cấu trúc:
1. USP SẢN PHẨM: 3 điểm bán hàng độc nhất nên khai thác.
2. MƯỜI HOOK CONTENT: 10 câu mở đầu video/bài viết đánh vào đúng tệp khách.
3. MỘT BÀI CONTENT MẪU: 1 bài bán hàng hoàn chỉnh khoảng 120-150 từ.
4. KỊCH BẢN CHỐT SALE: xử lý 3 từ chối phổ biến nhất (đắt quá, để suy nghĩ, sợ không hợp).
${AGENT_BASE_RULES}`,
      fallbackOutput: `**USP SẢN PHẨM**
- Kết quả nhìn thấy được: tập trung vào thay đổi cụ thể khách cảm nhận sau 7-14 ngày dùng.
- Dễ dùng, hợp người bận: một bước, không cần quy trình phức tạp.
- Có phản hồi thật: khai thác feedback khách cũ làm bằng chứng.

**MƯỜI HOOK CONTENT**
1. "Mình đã sai suốt 2 năm vì bỏ qua bước này..."
2. "Đừng mua sản phẩm này nếu bạn chưa xem hết video."
3. "Khách hỏi nhiều nhất câu này, hôm nay trả lời một lần."
4. "3 lỗi khiến bạn dùng mãi không thấy kết quả."
5. "So sánh thật: trước và sau 14 ngày."
6. "Giá này là đắt hay rẻ? Tính thử với mình."
7. "Feedback khách sáng nay làm mình phải quay video này."
8. "Nếu chỉ được chọn 1 sản phẩm, mình chọn cái này. Vì sao?"
9. "Cách kiểm tra bạn có đang dùng đúng loại không."
10. "Đơn hoàn là do 1 hiểu lầm này."

**BÀI CONTENT MẪU**
Nhiều bạn inbox hỏi vì sao dùng mãi không thấy khác biệt. Câu trả lời thường không nằm ở sản phẩm, mà ở cách dùng sai bước. Sản phẩm này sinh ra cho người bận: một bước duy nhất, sáng hoặc tối, đều đặn 14 ngày. Khách của mình phần lớn thấy thay đổi rõ từ tuần thứ hai, và feedback được lưu đủ trong album đính ghim. Giá hiện tại kèm quà cho 50 đơn đầu tuần. Bấm vào giỏ hàng hoặc inbox từ "TƯ VẤN" để mình xem tình trạng và hướng dẫn đúng cách dùng cho bạn.

**KỊCH BẢN CHỐT SALE**
- "Đắt quá": quy giá về theo ngày dùng, so với chi phí của việc không giải quyết vấn đề, kèm chính sách đổi trả.
- "Để suy nghĩ": hỏi lại điều khách còn lấn cấn, gửi feedback đúng tình huống của khách, hẹn giữ ưu đãi trong 24 giờ.
- "Sợ không hợp": hướng dẫn cách thử an toàn, nêu rõ chính sách hỗ trợ nếu không hợp, gửi case khách tương tự.

**CHI PHÍ CƠ HỘI BẠN ĐANG MẤT MỖI THÁNG**
Tiền mất lớn nhất của shop không phải giờ công, mà là sản lượng không tạo ra được:
- Nội dung: làm tay chỉ ra 2-3 content/ngày, có AI cùng thời gian đó ra 20-30 content chất lượng. Trên các nền tảng video ngắn, số lần "quay xổ số viral" tăng gấp 10 — thay vì tiếp cận vài nghìn người, shop có thể tiếp cận hàng trăm nghìn người/tháng. Chỉ cần 0,1% thành đơn, đó là hàng trăm đơn đang bị bỏ lỡ — với AOV vài trăm nghìn, doanh thu bỏ lỡ có thể tới hàng chục, hàng trăm triệu/tháng (ước tính minh họa, không phải cam kết).
- Inbox: trả lời sau 5 phút, tỷ lệ chốt rơi mạnh; inbox ban đêm không ai trực là đơn rơi thẳng vào tay đối thủ trả lời nhanh hơn.
- Ads: không phân tích kịp là ngân sách tiếp tục đổ vào nhóm quảng cáo lỗ thêm nhiều ngày.

**VIỆC LÀM NGAY TRONG 7 NGÀY**
- Ngày 1-2: lấy 10 hook ở trên, quay 2 video ngắn theo hook bạn thấy hợp sản phẩm nhất, đăng và theo dõi 3 giây đầu giữ được bao nhiêu người xem.
- Ngày 3-4: lưu bài content mẫu thành khung cố định (mở đầu - vấn đề - giải pháp - bằng chứng - CTA), dùng AI viết lại cho 3 sản phẩm khác trong shop.
- Ngày 5: gom 10 câu khách hay hỏi trong inbox, dùng AI soạn sẵn câu trả lời chuẩn, lưu thành file trả lời nhanh.
- Ngày 6-7: áp kịch bản xử lý từ chối vào các đơn đang treo, ghi lại câu nào chốt được để nhân bản.

**3 LỖI NHÀ BÁN HÀNG THƯỜNG GẶP**
- Dùng AI viết content nhưng bê nguyên không sửa: nghe giống quảng cáo mẫu, khách lướt qua. Cách né: luôn thêm chi tiết thật của shop (feedback, số đơn, tình huống khách).
- Chỉ tập trung content, bỏ quên khâu chốt: video nhiều view mà đơn không tăng. Cách né: đầu tư kịch bản trả lời inbox ngang với đầu tư video.
- Mỗi ngày thử một kiểu theo trend: không có dữ liệu để biết cái gì hiệu quả. Cách né: giữ 1 khung content chạy đủ 2 tuần rồi mới đổi.

Một Agent đã tạo được bộ content và kịch bản này trong một phút. Bước tiếp theo đáng học là tự xây hệ thống Agent chạy content, chăm khách và phân tích ads cho chính shop của bạn.`,
    },
    courses: [
      { name: "AI Business System", reason: "Xây hệ thống marketing-sales tự động 24/7 và kênh nội dung chi phí gần 0đ — khớp gap content, chăm khách, vận hành của shop." },
      { name: "AI Super Power", reason: "6 buổi tối làm chủ công cụ AI tạo nội dung viral và kéo traffic bán hàng." },
    ],
    roadmapPhases: [
      "Prompt content bán hàng chuẩn",
      "AI làm video và ảnh sản phẩm",
      "Kịch bản chốt sale + chăm khách bằng AI",
      "Automation inbox và đơn hàng",
      "AI Agent quản lý content đa kênh",
    ],
  },

  office: {
    id: "office",
    label: "Dân văn phòng",
    hook: "AI có thể thay bạn làm bao nhiêu % công việc mỗi ngày?",
    taskLibrary: [
      { id: "excel", label: "Excel / xử lý số liệu", aiSupportPct: 80, group: "quick_win" },
      { id: "email", label: "Email công việc", aiSupportPct: 90, group: "quick_win" },
      { id: "slide", label: "Làm slide thuyết trình", aiSupportPct: 75, group: "quick_win" },
      { id: "report", label: "Viết báo cáo", aiSupportPct: 80, group: "quick_win" },
      { id: "research", label: "Research / tổng hợp thông tin", aiSupportPct: 70, group: "chuan_hoa_du_lieu" },
      { id: "meeting", label: "Họp / biên bản", aiSupportPct: 60, group: "quick_win" },
      { id: "dichthuat", label: "Dịch thuật, soạn văn bản", aiSupportPct: 85, group: "quick_win" },
    ],
    goals: ["Tăng năng suất", "Về đúng giờ", "Tăng giá trị bản thân", "Kiếm thêm thu nhập"],
    painPoints: [
      "Excel, email, slide, báo cáo chiếm hết ngày",
      "Việc lặp lại nhàm chán, không còn giờ học thêm",
      "Sợ bị AI thay thế nhưng chưa biết bắt đầu từ đâu",
      "Muốn được ghi nhận và thăng tiến",
      "Việc ngày càng nhiều nhưng lương chưa tăng",
      "Muốn kiếm thêm thu nhập ngoài giờ",
    ],
    scaleQuestion: {
      label: "Vai trò hiện tại của bạn?",
      options: ["Nhân viên", "Chuyên viên / senior", "Trưởng nhóm", "Quản lý"],
    },
    agent: {
      name: "AI Office Assistant",
      intro: "Tôi đã tạo sẵn AI Office Assistant cho bạn. Đưa 1 task thật bạn đang phải làm, Agent xử lý ngay.",
      inputLabel: "Một task thật bạn đang cần làm (email, outline báo cáo, slide, tổng hợp...)",
      inputPlaceholder: "Ví dụ: Viết email báo cáo tiến độ dự án cho sếp, tuần này xong 3/5 hạng mục, chậm 2 hạng mục do chờ đối tác",
      systemPrompt: `Bạn là AI Office Assistant cho dân văn phòng Việt Nam. Người dùng đưa một task thật. Hãy:
1. LÀM XONG TASK ĐÓ: cho ra sản phẩm hoàn chỉnh dùng được ngay (email hoàn chỉnh, outline chi tiết, bảng kế hoạch...).
2. CÁCH TÁI SỬ DỤNG: viết lại thành 1 prompt mẫu người dùng lưu lại dùng cho các lần sau.
3. BA VIỆC CÙNG LOẠI NÊN AI HÓA TIẾP: gợi ý 3 task tương tự trong công việc văn phòng nên chuyển sang AI, mỗi task 1 dòng lý do.
${AGENT_BASE_RULES}`,
      fallbackOutput: `**TASK CỦA BẠN - EMAIL BÁO CÁO TIẾN ĐỘ (MẪU)**
Kính gửi anh/chị,
Em cập nhật tiến độ dự án tuần này như sau. Nhóm đã hoàn thành 3/5 hạng mục theo kế hoạch, gồm các phần việc chính đã nghiệm thu nội bộ. Hai hạng mục còn lại đang chậm so với lịch do chờ phản hồi từ đối tác; em đã gửi nhắc lần hai và đề xuất lịch họp chốt trong tuần tới. Rủi ro chính hiện tại là tiến độ đối tác; phương án dự phòng là tách phần việc không phụ thuộc để chạy trước. Em đề xuất giữ mục tiêu bàn giao như kế hoạch và sẽ báo cáo ngay khi có phản hồi.
Trân trọng.

**PROMPT MẪU ĐỂ TÁI SỬ DỤNG**
"Viết email báo cáo tiến độ cho quản lý, giọng chuyên nghiệp, ngắn gọn. Thông tin: [việc đã xong], [việc chậm + lý do], [hành động đã làm], [rủi ro], [đề xuất]. Kết thúc bằng cam kết cập nhật."

**BA VIỆC NÊN AI HÓA TIẾP**
- Biên bản họp: ghi âm rồi cho AI tách quyết định và đầu việc, hết cảnh ngồi gõ lại.
- Slide báo cáo tháng: đưa số liệu, AI dựng outline và nội dung từng trang.
- Tổng hợp research: AI đọc và tóm tắt tài liệu dài thành 1 trang trọng tâm.

**CHI PHÍ CƠ HỘI BẠN ĐANG MẤT MỖI THÁNG**
Với người đi làm, chi phí cơ hội không chỉ là giờ tăng ca:
- Sản lượng: người biết AI xử lý được gấp 5-10 lần khối lượng cùng vị trí — báo cáo 2 giờ còn 15 phút, slide 1 buổi còn 30 phút. Khoảng cách này đang trở thành khoảng cách lương thưởng và cơ hội thăng tiến giữa hai nhóm nhân sự.
- Thu nhập phụ: mỗi buổi tối bị việc lặp lại ăn mất là một buổi không thể học kỹ năng mới hoặc nhận việc ngoài — nhiều kỹ năng AI đang được thị trường trả vài trăm nghìn đến vài triệu cho mỗi sản phẩm (ước tính minh họa theo mặt bằng thị trường, không phải cam kết).
- Vị thế: khi công ty tinh gọn, người "làm được việc của 3 người nhờ AI" là người được giữ lại và đề bạt.

**VIỆC LÀM NGAY TRONG 7 NGÀY**
- Ngày 1-2: lưu prompt mẫu ở trên, dùng cho mọi email quan trọng trong 2 ngày, để ý thời gian soạn giảm bao nhiêu.
- Ngày 3: chọn 1 báo cáo định kỳ, đưa số liệu cho AI dựng khung và viết nháp, bạn chỉ rà và chỉnh.
- Ngày 4-5: lấy 1 file Excel đang làm dở, nhờ AI viết công thức hoặc tóm tắt dữ liệu — gõ thẳng yêu cầu bằng tiếng Việt.
- Ngày 6-7: liệt kê mọi việc lặp lại trong tuần, đánh dấu việc nào đã có prompt, việc nào chưa — đó là danh sách học tiếp của bạn.

**3 LỖI DÂN VĂN PHÒNG THƯỜNG GẶP**
- Hỏi AI chung chung rồi kết luận "AI trả lời dở": thiếu bối cảnh thì ai cũng trả lời dở. Cách né: luôn cho AI biết vai trò, người nhận, mục đích trước khi giao việc.
- Mỗi lần dùng lại gõ yêu cầu từ đầu: tốn thời gian và kết quả không ổn định. Cách né: việc nào làm quá 2 lần thì lưu thành prompt chuẩn.
- Giấu sếp việc dùng AI: làm nhanh hơn nhưng không ai ghi nhận. Cách né: chủ động đề xuất quy trình mới cho cả nhóm — đây là cách được nhìn thấy.

Một task vừa xong trong một phút. Nếu bạn học cách nối các task này thành quy trình tự động, mỗi ngày có thể lấy lại vài giờ — đó là bước tiếp theo đáng đầu tư.`,
    },
    courses: [
      { name: "AI Super Power", reason: "6 buổi tối tăng tốc công việc văn phòng bằng AI và mở thêm nguồn thu nhập từ kỹ năng mới." },
      { name: "Siêu Trợ Lý Nhân Hiệu", reason: "Biến AI thành trợ lý cá nhân xử lý email, slide, báo cáo và xây nhân hiệu của riêng bạn." },
    ],
    roadmapPhases: [
      "Prompt chuẩn cho email và báo cáo",
      "AI hóa Excel và xử lý số liệu",
      "Slide và tài liệu bằng AI",
      "Quy trình cá nhân tự động",
      "Trợ lý AI cá nhân hoàn chỉnh",
    ],
  },

  affiliate: {
    id: "affiliate",
    label: "Affiliate / MMO",
    hook: "AI Affiliate Score của bạn là bao nhiêu?",
    taskLibrary: [
      { id: "timsp", label: "Tìm sản phẩm tiềm năng", aiSupportPct: 75, group: "chuan_hoa_du_lieu" },
      { id: "script", label: "Viết script video", aiSupportPct: 85, group: "quick_win" },
      { id: "video", label: "Sản xuất video", aiSupportPct: 70, group: "quick_win" },
      { id: "caption", label: "Caption + hashtag + đăng bài", aiSupportPct: 85, group: "quick_win" },
      { id: "phantich", label: "Phân tích video nào ra đơn", aiSupportPct: 70, group: "chuan_hoa_du_lieu" },
      { id: "scale", label: "Nhân kênh / scale nội dung", aiSupportPct: 60, group: "agent_automation" },
    ],
    goals: ["Có thu nhập đầu tiên từ affiliate", "Tăng thu nhập hiện tại", "Làm faceless không lộ mặt", "Scale nhiều kênh"],
    painPoints: [
      "Khó tìm sản phẩm ngon",
      "Viết script và làm video quá chậm",
      "Đăng nhiều nhưng không ra đơn",
      "Không đủ sức làm nội dung đều",
      "Video có view nhưng không chuyển thành đơn",
      "Chưa biết chọn ngách nào để bắt đầu",
    ],
    scaleQuestion: {
      label: "Bạn đang ở giai đoạn nào?",
      options: ["Chưa bắt đầu", "Đã có kênh, chưa có đơn", "Đã có đơn lẻ tẻ", "Có thu nhập đều, muốn scale"],
    },
    agent: {
      name: "AI Product Hunter + Script Creator",
      intro: "Tôi đã tạo sẵn AI Product Hunter cho bạn. Chọn ngách bạn muốn làm, Agent sẽ gợi ý sản phẩm và viết luôn script video đầu tiên.",
      inputLabel: "Ngách muốn làm + nền tảng + có quay mặt không",
      inputPlaceholder: "Ví dụ: Ngách đồ gia dụng, làm TikTok faceless, chưa có follower",
      systemPrompt: `Bạn là AI Product Hunter kiêm Script Creator cho người làm affiliate Việt Nam. Từ ngách và nền tảng người dùng chọn, hãy trả về đúng cấu trúc:
1. BA NHÓM SẢN PHẨM TIỀM NĂNG: mỗi nhóm ghi lý do phù hợp ngách + góc content nên đánh (không bịa số liệu hoa hồng cụ thể).
2. MỘT SCRIPT VIDEO 30 GIÂY HOÀN CHỈNH: hook 3 giây đầu, thân bài, CTA; định dạng phù hợp faceless nếu người dùng không quay mặt.
3. CAPTION + 5 HASHTAG.
4. PROMPT TẠO VIDEO: 1 prompt mô tả cảnh quay/B-roll để dùng với công cụ tạo video AI.
${AGENT_BASE_RULES}`,
      fallbackOutput: `**BA NHÓM SẢN PHẨM TIỀM NĂNG (ngách gia dụng, minh họa)**
- Đồ bếp giải quyết một khó chịu cụ thể (dụng cụ cắt gọt, hộp bảo quản): dễ demo trước-sau trong 15 giây, hợp faceless.
- Đồ dọn dẹp thông minh (cây lau, con lăn bụi): góc content "test thử xem có như quảng cáo", giữ chân người xem tốt.
- Đồ phòng tắm tiện ích (kệ, móc, xịt): giá mềm, khách chốt nhanh, hợp video liệt kê "5 món dưới 100k".

**SCRIPT VIDEO 30 GIÂY (faceless)**
- Hook (0-3s, chữ to trên nền video): "Món này khiến mình vứt luôn cái cũ."
- Thân (3-22s): quay cận cảnh thao tác dùng thật, 3 cảnh: vấn đề cũ gây khó chịu, thao tác với sản phẩm, kết quả sau khi dùng. Voice: "Trước đây mỗi lần làm việc này mình mất cả buổi tối. Từ lúc có món này, đúng một thao tác là xong. Điểm mình thích nhất là dọn rửa cực nhanh."
- CTA (22-30s): "Mình để link ở giỏ hàng, ai hay gặp cảnh này thì thử nhé."

**CAPTION + HASHTAG**
"Biết món này sớm hơn thì đỡ khổ bao nhiêu 😅 Link ở giỏ hàng nha!"
#dogiadung #tiktokshop #meovat #giadinh #reviewchanthat

**PROMPT TẠO VIDEO**
"Video dọc 9:16, ánh sáng tự nhiên trong bếp gia đình Việt, quay cận cảnh đôi tay thao tác sản phẩm, 3 cảnh: tình huống bất tiện cũ, thao tác với sản phẩm mới, kết quả gọn gàng; nhịp cắt nhanh 2-3 giây mỗi cảnh, không lộ mặt."

**CHI PHÍ CƠ HỘI BẠN ĐANG MẤT MỖI THÁNG**
Affiliate là trò chơi xác suất — sản lượng quyết định tất cả:
- Làm tay 1 video/ngày = 30 lượt thử viral/tháng. Có AI làm 5-10 video/ngày = 150-300 lượt thử — xác suất trúng video ăn đơn tăng gấp 5-10 lần với cùng thời gian bỏ ra.
- Mỗi video viral hụt vì đăng chậm trend 1-2 ngày là hàng chục nghìn đến hàng trăm nghìn lượt tiếp cận mất trắng; chỉ 0,1% trong đó bấm giỏ hàng cũng đã là hàng trăm lượt bấm không bao giờ quay lại (ước tính minh họa, không phải cam kết).
- Người làm affiliate thắng cuộc không phải người làm video hay nhất, mà người thử được nhiều nhất với chi phí thấp nhất — đó chính là lợi thế AI đem lại.

**VIỆC LÀM NGAY TRONG 7 NGÀY**
- Ngày 1: chốt 1 ngách duy nhất trong 3 nhóm sản phẩm ở trên, đăng ký affiliate cho 3-5 sản phẩm trong ngách đó.
- Ngày 2-4: mỗi ngày làm 1 video theo đúng script mẫu (quay bằng điện thoại hoặc dựng bằng công cụ AI), đăng đều một khung giờ.
- Ngày 5: xem số liệu 3 video: video nào giữ chân qua giây thứ 3 tốt nhất thì nhân bản góc quay và kiểu hook đó.
- Ngày 6-7: làm tiếp 2 video theo công thức thắng, gắn link giỏ hàng, theo dõi lượt bấm vào giỏ.

**3 LỖI NGƯỜI MỚI LÀM AFFILIATE THƯỜNG GẶP**
- Nhảy ngách liên tục: mỗi ngách một video thì thuật toán không biết đẩy bạn cho ai. Cách né: cam kết 1 ngách ít nhất 30 video.
- Chọn sản phẩm theo hoa hồng cao thay vì theo độ dễ demo: video khó thuyết phục, không ra đơn. Cách né: ưu tiên sản phẩm nhìn thấy kết quả trong 15 giây.
- Kỳ vọng ra đơn trong tuần đầu rồi bỏ: giai đoạn đầu là giai đoạn mua dữ liệu. Cách né: đặt mục tiêu theo số video đăng, không theo số đơn.

Bạn vừa có sản phẩm, script, caption và prompt video trong một phút. Bước tiếp theo đáng học là xây cả dây chuyền: AI tìm sản phẩm, viết script, dựng video và phân tích đơn cho nhiều kênh cùng lúc.`,
    },
    courses: [
      { name: "AI Super Power", reason: "Có riêng phần tối ưu affiliate bằng AI: tìm sản phẩm, làm nội dung viral, kéo traffic — khớp thẳng gap của bạn." },
      { name: "AI Business System", reason: "Nâng cấp từ làm affiliate đơn lẻ lên hệ thống kênh nội dung và bán hàng tự động." },
    ],
    roadmapPhases: [
      "Chọn ngách + AI tìm sản phẩm",
      "Script video bằng AI mỗi ngày",
      "Sản xuất video AI hàng loạt",
      "Phân tích dữ liệu đơn và tối ưu",
      "Scale đa kênh bằng Agent",
    ],
  },

  marketing: {
    id: "marketing",
    label: "Marketing",
    hook: "Bạn có thể tăng năng suất bao nhiêu % nếu biết dùng đúng 5 công cụ AI?",
    taskLibrary: [
      { id: "research", label: "Research thị trường / đối thủ", aiSupportPct: 75, group: "chuan_hoa_du_lieu" },
      { id: "plan", label: "Lập kế hoạch content / campaign", aiSupportPct: 75, group: "quick_win" },
      { id: "content", label: "Sản xuất content đa kênh", aiSupportPct: 85, group: "quick_win" },
      { id: "ads", label: "Viết + phân tích quảng cáo", aiSupportPct: 80, group: "chuan_hoa_du_lieu" },
      { id: "report", label: "Báo cáo marketing", aiSupportPct: 85, group: "quick_win" },
      { id: "design", label: "Thiết kế ảnh / visual", aiSupportPct: 70, group: "quick_win" },
    ],
    goals: ["Tăng hiệu quả campaign", "Ra content nhanh gấp nhiều lần", "Đỡ phụ thuộc designer/agency", "Thăng tiến trong nghề"],
    painPoints: [
      "Research và báo cáo ngốn thời gian",
      "Deadline content dồn dập",
      "Phân tích ads thủ công",
      "Ý tưởng cạn dần",
      "Ngân sách bị cắt nhưng KPI giữ nguyên",
      "Phụ thuộc designer / agency, chờ đợi lâu",
    ],
    scaleQuestion: {
      label: "Bạn đang làm marketing ở đâu?",
      options: ["Doanh nghiệp của mình", "Nhân viên in-house", "Agency", "Freelancer"],
    },
    agent: {
      name: "AI Marketing Planner",
      intro: "Tôi đã tạo sẵn AI Marketing Planner cho bạn. Nhập sản phẩm và ngân sách, Agent dựng khung campaign ngay.",
      inputLabel: "Sản phẩm/dịch vụ + ngân sách tháng + KPI mong muốn",
      inputPlaceholder: "Ví dụ: Khóa học tiếng Anh online, ngân sách 50 triệu/tháng, KPI 200 lead",
      systemPrompt: `Bạn là AI Marketing Planner cho marketer Việt Nam. Từ sản phẩm, ngân sách và KPI người dùng nhập, hãy trả về đúng cấu trúc:
1. PHỄU ĐỀ XUẤT: các tầng phễu từ traffic đến chuyển đổi cho sản phẩm này.
2. CHANNEL MIX: phân bổ kênh và tỷ trọng ngân sách đề xuất (ghi rõ là đề xuất tham khảo).
3. KẾ HOẠCH CONTENT 2 TUẦN: chủ đề theo ngày, mỗi ngày 1 dòng.
4. CÁCH ĐO KPI: các chỉ số cần theo dõi và ngưỡng cảnh báo.
${AGENT_BASE_RULES}`,
      fallbackOutput: `**PHỄU ĐỀ XUẤT**
- Tầng nhận biết: video ngắn + bài viết giá trị kéo đúng tệp.
- Tầng cân nhắc: landing page + lead magnet (tài liệu/test miễn phí) đổi lấy thông tin liên hệ.
- Tầng chuyển đổi: chuỗi nurture qua Zalo/email + tư vấn trực tiếp.
- Tầng giữ chân: cộng đồng và chương trình giới thiệu.

**CHANNEL MIX (đề xuất tham khảo)**
- 40% kênh video ngắn (TikTok/Reels) cho tầng nhận biết.
- 35% quảng cáo chuyển đổi về landing page.
- 15% remarketing tệp đã tương tác.
- 10% thử nghiệm kênh mới, đánh giá theo 2 tuần.

**KẾ HOẠCH CONTENT 2 TUẦN**
Tuần 1: nỗi đau chính của tệp; sai lầm phổ biến; câu chuyện khách hàng; hướng dẫn nhanh; so sánh cách cũ và mới; hỏi đáp; recap tuần.
Tuần 2: hậu trường; số liệu gây tò mò; phản hồi người dùng; hướng dẫn sâu; thách thức 7 ngày; ưu đãi; tổng kết và CTA.

**CÁCH ĐO KPI**
- CPL theo kênh, cảnh báo khi vượt ngưỡng kế hoạch 20%.
- Tỷ lệ landing chuyển thành lead; dưới 15% cần sửa trang trước khi tăng ngân sách.
- Tỷ lệ lead ra cuộc hẹn tư vấn; đo riêng theo nguồn để cắt kênh kém.

**CHI PHÍ CƠ HỘI BẠN ĐANG MẤT MỖI THÁNG**
Với marketing, chi phí cơ hội nằm ở số lần được thử:
- Content: đội thủ công ra 2-3 bài/ngày, cùng đội đó có AI ra 20-30 bài chất lượng — tiếp cận từ vài nghìn lên hàng trăm nghìn người/tháng. Với tỷ lệ chuyển đổi chỉ 0,1%, đó là hàng trăm lead đang bị bỏ lỡ mỗi tháng; nhân với giá trị một lead của ngành bạn sẽ ra con số doanh thu tiềm năng có thể tới hàng trăm triệu (ước tính minh họa, không phải cam kết).
- Thử nghiệm: chạy được 2 campaign test/tháng thay vì 10 nghĩa là chậm tìm ra công thức thắng gấp 5 lần — trong khi đối thủ dùng AI đang thử nhanh hơn bạn.
- Tốc độ trend: trend chỉ sống 24-48 giờ; sản xuất chậm là mất trọn đợt sóng traffic miễn phí.

**VIỆC LÀM NGAY TRONG 7 NGÀY**
- Ngày 1-2: dùng AI research 3 đối thủ trực tiếp (định vị, giá, kênh, góc content họ đang thắng), tóm thành 1 trang.
- Ngày 3-4: dựng lịch content 2 tuần theo khung ở trên, dùng AI viết nháp 5 bài đầu, bạn chỉ biên tập giọng thương hiệu.
- Ngày 5: đổ số liệu ads tháng gần nhất cho AI phân tích: nhóm nào CPL cao bất thường, nhóm nào đáng tăng ngân sách.
- Ngày 6-7: dựng khung báo cáo tuần chuẩn để từ nay AI điền số và viết nhận xét, bạn chỉ duyệt.

**3 LỖI MARKETER THƯỜNG GẶP KHI DÙNG AI**
- Dùng AI như người viết thuê, không đưa dữ liệu thật: content chung chung, không có insight. Cách né: luôn kèm số liệu, phản hồi khách, thông tin sản phẩm khi giao việc cho AI.
- Đo lường bằng cảm giác: không biết AI giúp tiết kiệm bao nhiêu để đề xuất nhân rộng. Cách né: bấm giờ trước - sau cho từng loại việc trong 2 tuần.
- Giữ kỹ năng cho riêng mình: một mình bạn nhanh không cứu được deadline cả team. Cách né: đóng gói prompt thành thư viện chung của team.

Khung này AI dựng trong một phút. Bước tiếp theo đáng học là nối cả phễu thành hệ thống: AI research, sản xuất content, phân tích ads và báo cáo tự động hàng tuần.`,
    },
    courses: [
      { name: "AI Super Power", reason: "6 buổi tối làm chủ AI tạo nội dung viral, kéo traffic và tăng tốc mọi đầu việc marketing." },
      { name: "AI Business System", reason: "Hệ thống hóa toàn bộ marketing-sales thành cỗ máy tự động 24/7." },
    ],
    roadmapPhases: [
      "Prompt research và phân tích đối thủ",
      "Dây chuyền content đa kênh bằng AI",
      "AI phân tích ads và ngân sách",
      "Báo cáo marketing tự động",
      "AI Agent marketing hoàn chỉnh",
    ],
  },

  sales: {
    id: "sales",
    label: "Sales",
    hook: "AI có thể giúp bạn chốt thêm bao nhiêu khách mỗi tháng?",
    taskLibrary: [
      { id: "kichban", label: "Soạn kịch bản gọi / nhắn", aiSupportPct: 80, group: "quick_win" },
      { id: "followup", label: "Follow-up khách hàng", aiSupportPct: 75, group: "agent_automation" },
      { id: "objection", label: "Xử lý từ chối", aiSupportPct: 70, group: "quick_win" },
      { id: "crm", label: "Nhập liệu CRM / ghi chú", aiSupportPct: 80, group: "quick_win" },
      { id: "research_khach", label: "Tìm hiểu khách trước cuộc gọi", aiSupportPct: 75, group: "chuan_hoa_du_lieu" },
      { id: "baocao", label: "Báo cáo pipeline", aiSupportPct: 85, group: "quick_win" },
    ],
    goals: ["Chốt nhiều đơn hơn", "Đỡ tốn giờ việc giấy tờ", "Follow-up không sót khách", "Lên trưởng nhóm"],
    painPoints: [
      "Kịch bản gọi chưa sắc",
      "Từ chối nhiều mà chưa xử lý tốt",
      "Quên follow-up, sót khách",
      "Việc nhập liệu chiếm giờ bán hàng",
      "Data khách cũ bỏ không, chưa khai thác lại",
      "Khó tìm hiểu khách trước khi gặp",
    ],
    scaleQuestion: {
      label: "Bạn đang bán gì?",
      options: ["Sản phẩm B2C", "Dịch vụ B2C", "Giải pháp B2B", "Bất động sản / tài chính / bảo hiểm"],
    },
    agent: {
      name: "AI Sales Coach",
      intro: "Tôi đã tạo sẵn AI Sales Coach cho bạn. Nhập sản phẩm và từ chối hay gặp nhất, Agent huấn luyện ngay.",
      inputLabel: "Sản phẩm đang bán + lời từ chối hay gặp nhất",
      inputPlaceholder: "Ví dụ: Bán gói bảo hiểm sức khỏe, khách hay nói 'để anh bàn với vợ đã'",
      systemPrompt: `Bạn là AI Sales Coach cho sales Việt Nam. Từ sản phẩm và lời từ chối người dùng nhập, hãy trả về đúng cấu trúc:
1. CALL FLOW CHUẨN: các bước một cuộc gọi/cuộc gặp hiệu quả cho sản phẩm này.
2. XỬ LÝ TỪ CHỐI: phân tích tâm lý sau lời từ chối đó + 3 cách phản hồi theo 3 phong cách (đồng cảm, số liệu, câu chuyện), mỗi cách có lời thoại mẫu.
3. KỊCH BẢN FOLLOW-UP 7 NGÀY: nhắn gì vào ngày 1, 3, 7.
${AGENT_BASE_RULES}`,
      fallbackOutput: `**CALL FLOW CHUẨN**
- Mở đầu 30 giây: xưng danh, lý do gọi gắn với lợi ích cụ thể của khách, xin 2 phút.
- Khai thác: 3 câu hỏi về tình trạng hiện tại, điều khách lo, điều khách muốn.
- Trình bày: chỉ nói phần khớp với điều khách vừa chia sẻ, không đọc hết brochure.
- Chốt thử: "Nếu giải quyết được đúng điều anh/chị vừa nói thì mình đi tiếp bước nào?"
- Kết thúc: chốt lịch hẹn cụ thể hoặc cam kết gửi tài liệu kèm giờ gọi lại.

**XỬ LÝ TỪ CHỐI "ĐỂ BÀN VỚI VỢ/CHỒNG ĐÃ"**
Tâm lý thật: khách chưa đủ tin hoặc chưa thấy cấp thiết; "bàn với người nhà" là cách hoãn lịch sự.
- Phong cách đồng cảm: "Dạ đúng rồi anh, việc này nên có chị cùng nghe. Hay em xin 15 phút gọi chung cho cả hai anh chị, em nói ngắn phần chính thôi, anh chị quyết sau cũng được ạ."
- Phong cách số liệu: "Dạ, trước khi anh trao đổi với chị, em gửi anh bảng so sánh 3 phương án kèm chi phí theo tháng để anh chị có số cụ thể mà bàn. Em gọi lại tối mai được không ạ?"
- Phong cách câu chuyện: "Em có khách cũng nói y vậy, sau anh ấy rủ chị nghe cùng 10 phút, hóa ra điều chị lo nhất lại là phần em chưa kịp nói. Em xin một cuộc gọi chung ngắn được không ạ?"

**FOLLOW-UP 7 NGÀY**
- Ngày 1: cảm ơn + tóm tắt 3 ý chính đã trao đổi + tài liệu đúng mối quan tâm.
- Ngày 3: gửi một case khách tương tự hoàn cảnh + hỏi một câu mở.
- Ngày 7: tạo lý do chốt nhẹ nhàng (thay đổi chính sách, lịch trống) + đề xuất 2 khung giờ hẹn.

**CHI PHÍ CƠ HỘI BẠN ĐANG MẤT MỖI THÁNG**
Doanh số sales là hàm của số lần chạm khách — và đây là chỗ đang rò rỉ tiền:
- Follow-up: chăm tay được 20-30 khách/tuần, có AI soạn tin và nhắc lịch thì cùng thời gian đó chạm được 100-200 khách. Mỗi khách quên follow-up là một hợp đồng có thể đã ký với người khác — chỉ cần 2-3 hợp đồng rơi mỗi tháng, số tiền mất đã tính bằng chục triệu tùy ngành (ước tính minh họa, không phải cam kết).
- Data khách cũ: tệp vài trăm - vài nghìn khách từng quan tâm đang nằm im là tài sản đóng băng; AI có thể giúp tái kích hoạt hàng loạt mà không tốn thêm giờ nào.
- Giờ vàng: mỗi giờ nhập liệu là một giờ không gọi khách — người bán giỏi nhất công ty cũng chỉ có 8 giờ/ngày như bạn, khác nhau ở chỗ giờ đó dành cho việc gì.

**VIỆC LÀM NGAY TRONG 7 NGÀY**
- Ngày 1-2: ghi lại 5 lời từ chối bạn gặp nhiều nhất, dùng AI soạn 2 cách phản hồi cho mỗi lời, lưu thành "ngân hàng xử lý từ chối" của riêng bạn.
- Ngày 3: áp call flow ở trên vào 3 cuộc gọi thật, để ý bước nào bạn hay bỏ qua nhất.
- Ngày 4-5: soạn bộ tin nhắn follow-up ngày 1-3-7 bằng AI, cài lời nhắc để không sót khách nào đang treo.
- Ngày 6-7: trước mỗi cuộc hẹn, dành 5 phút cho AI tóm tắt thông tin khách và gợi ý 3 câu hỏi mở đầu.

**3 LỖI SALES THƯỜNG GẶP**
- Đọc kịch bản như trả bài: khách nghe ra ngay. Cách né: dùng kịch bản làm khung, luyện đến khi nói được bằng lời của mình.
- Chỉ chăm khách mới, bỏ data khách cũ: mỏ vàng nằm ở người từng quan tâm. Cách né: mỗi tuần dành 1 buổi cho AI soạn tin tái kết nối tệp cũ.
- Không ghi chú sau cuộc gọi: lần gọi sau bắt đầu lại từ đầu. Cách né: nói lại nội dung chính vào điện thoại, để AI chuyển thành ghi chú CRM.

Một Agent huấn luyện được như vậy trong một phút. Bước tiếp theo đáng học là xây trợ lý sales của riêng bạn: tự ghi chú CRM, nhắc follow-up và luyện kịch bản mỗi ngày.`,
    },
    courses: [
      { name: "AI Super Power", reason: "6 buổi tối làm chủ AI cho kịch bản, follow-up và tăng tốc mọi việc lặp lại trong sales." },
      { name: "AI Business System", reason: "Xây hệ thống sales và chăm khách tự động 24/7 bằng AI." },
    ],
    roadmapPhases: [
      "Kịch bản gọi và nhắn bằng AI",
      "Ngân hàng xử lý từ chối cá nhân",
      "AI ghi chú và nhập CRM",
      "Automation follow-up",
      "AI Sales Coach luyện tập hàng ngày",
    ],
  },

  hr: {
    id: "hr",
    label: "HR / Kế toán",
    hook: "AI có thể gánh bao nhiêu % việc nhân sự, giấy tờ và sổ sách của bạn?",
    taskLibrary: [
      { id: "jd", label: "Viết JD / tin tuyển dụng", aiSupportPct: 85, group: "quick_win" },
      { id: "cv", label: "Lọc và đánh giá CV", aiSupportPct: 75, group: "chuan_hoa_du_lieu" },
      { id: "onboarding", label: "Tài liệu onboarding / đào tạo", aiSupportPct: 80, group: "quick_win" },
      { id: "chamcong", label: "Báo cáo nhân sự / chấm công / lương", aiSupportPct: 70, group: "agent_automation" },
      { id: "hoadon", label: "Nhập liệu hóa đơn, chứng từ", aiSupportPct: 80, group: "quick_win" },
      { id: "doisoat", label: "Đối soát công nợ, sổ sách", aiSupportPct: 70, group: "chuan_hoa_du_lieu" },
      { id: "baocao_tc", label: "Báo cáo tài chính / thuế định kỳ", aiSupportPct: 65, group: "chuan_hoa_du_lieu" },
    ],
    goals: ["Giảm việc giấy tờ, nhập liệu", "Tuyển nhanh và đúng người hơn", "Báo cáo nhanh, ít sai sót", "Nâng vai trò trong công ty"],
    painPoints: [
      "Nhập liệu hóa đơn, chứng từ chiếm quá nhiều giờ",
      "Lọc CV, làm JD thủ công quá lâu",
      "Báo cáo lương, thuế, công nợ dồn cuối tháng",
      "Quy trình giấy tờ mỗi lần một kiểu",
      "Số liệu nằm rải rác nhiều file Excel",
      "Tuyển mãi không đủ người",
    ],
    scaleQuestion: {
      label: "Quy mô công ty bạn phụ trách?",
      options: ["Dưới 20 người", "20-50 người", "51-200 người", "Trên 200 người"],
    },
    agent: {
      name: "AI HR Assistant",
      intro: "Tôi đã tạo sẵn AI HR Assistant cho bạn. Nhập vị trí đang tuyển, Agent tạo bộ tuyển dụng hoàn chỉnh ngay.",
      inputLabel: "Vị trí đang tuyển + tiêu chí quan trọng nhất",
      inputPlaceholder: "Ví dụ: Tuyển nhân viên content, cần biết làm video ngắn, ưu tiên chủ động",
      systemPrompt: `Bạn là AI HR Assistant cho HR Việt Nam. Từ vị trí và tiêu chí người dùng nhập, hãy trả về đúng cấu trúc:
1. JD HOÀN CHỈNH: tin tuyển dụng hấp dẫn, đúng cấu trúc, sẵn sàng đăng.
2. SCORECARD LỌC CV: 5-7 tiêu chí chấm điểm ứng viên kèm thang điểm.
3. BỘ CÂU HỎI PHỎNG VẤN: 6 câu, trong đó có câu tình huống và câu kiểm tra tiêu chí quan trọng nhất.
4. CHECKLIST ONBOARDING TUẦN ĐẦU: theo ngày.
${AGENT_BASE_RULES}`,
      fallbackOutput: `**JD MẪU - NHÂN VIÊN CONTENT (VIDEO NGẮN)**
Chúng tôi tìm một bạn content biến ý tưởng thành video ngắn có người xem thật. Việc của bạn: lên ý tưởng và kịch bản video cho TikTok/Reels, quay dựng cơ bản bằng điện thoại và công cụ AI, đọc số liệu để biết video nào hiệu quả và làm tiếp. Bạn phù hợp nếu: đã từng tự làm kênh hoặc sản phẩm video ngắn (kể cả cá nhân), chủ động đề xuất thay vì chờ giao việc, thích đo lường hơn cảm tính. Quyền lợi: lương thỏa thuận theo năng lực, được dùng bộ công cụ AI trả phí, lộ trình lên leader content rõ ràng. Gửi CV kèm 1-2 video bạn từng làm.

**SCORECARD LỌC CV (thang 1-5 mỗi tiêu chí)**
- Có sản phẩm video ngắn thực tế
- Tư duy nội dung: hook, giữ chân người xem
- Kỹ năng dựng cơ bản (CapCut hoặc tương đương)
- Chủ động: từng tự khởi xướng dự án/kênh
- Hiểu số liệu: biết đọc view, giữ chân, chuyển đổi
- Phù hợp văn hóa: tinh thần học nhanh, nhận feedback

**BỘ CÂU HỎI PHỎNG VẤN**
1. Video tốt nhất bạn từng làm: quá trình từ ý tưởng đến kết quả?
2. Một video bạn nghĩ sẽ tốt nhưng thất bại: bạn học được gì?
3. Tình huống: sếp cần 5 video trong 2 ngày cho chiến dịch gấp, bạn xử lý thế nào?
4. Bạn dùng AI vào khâu nào trong quy trình làm video?
5. Nếu video đăng 1 tuần không ai xem, bạn kiểm tra những gì?
6. Điều gì khiến bạn chủ động làm mà không cần ai giao?

**CHECKLIST ONBOARDING TUẦN ĐẦU**
- Ngày 1: tài khoản, công cụ, gặp team, đọc guideline thương hiệu.
- Ngày 2: xem 10 video hiệu quả nhất của công ty + ghi nhận xét.
- Ngày 3: làm 1 video thử có mentor kèm.
- Ngày 4: nhận feedback, sửa và đăng video đầu tiên.
- Ngày 5: tổng kết tuần, thống nhất mục tiêu tháng đầu.

**CHI PHÍ CƠ HỘI BẠN ĐANG MẤT MỖI THÁNG**
Chi phí cơ hội của HR / Kế toán thường vô hình nhưng rất lớn:
- Tuyển chậm: một vị trí kinh doanh trống thêm 1 tháng vì lọc CV thủ công là 1 tháng doanh số của vị trí đó mất trắng — thường lớn gấp nhiều lần lương của chính vị trí ấy (ước tính minh họa, không phải cam kết).
- Chốt sổ chậm: số liệu ra trễ 1-2 tuần nghĩa là sếp ra quyết định trên dữ liệu cũ — chi phí lãng phí tiếp tục chạy trong lúc chờ báo cáo.
- Sản lượng xử lý: nhập liệu tay 50-100 chứng từ/ngày, có AI hỗ trợ có thể xử lý gấp 5-10 lần và giảm sai sót — sai một con số trong bảng lương hay tờ khai thuế, chi phí sửa sai luôn đắt hơn nhiều lần chi phí làm đúng.

**VIỆC LÀM NGAY TRONG 7 NGÀY**
- Ngày 1-2: dùng bộ JD + scorecard ở trên cho vị trí đang tuyển, đăng tin và chấm 5 CV đầu tiên theo scorecard thay vì theo cảm giác.
- Ngày 3: chọn 1 loại giấy tờ lặp lại nhiều nhất (hợp đồng, quyết định, thông báo), dựng mẫu chuẩn để AI điền thông tin từng trường hợp.
- Ngày 4-5: lấy 1 bảng chấm công hoặc bảng kê đang làm tay, nhờ AI viết công thức tổng hợp và chỉ ra dòng bất thường.
- Ngày 6-7: dựng checklist onboarding chuẩn từ mẫu ở trên, lưu thành quy trình dùng lại cho mọi nhân sự mới.

**3 LỖI HR / KẾ TOÁN THƯỜNG GẶP**
- Đưa dữ liệu nhạy cảm (lương, số tài khoản, CCCD) vào công cụ AI công cộng: rủi ro bảo mật. Cách né: ẩn danh dữ liệu trước khi đưa AI xử lý, chỉ giữ cấu trúc.
- Tin 100% số liệu AI tính: AI hỗ trợ rất tốt nhưng vẫn cần bước rà soát. Cách né: luôn đối chiếu ngẫu nhiên vài dòng trước khi chốt sổ.
- Làm mẫu mới mỗi lần phát sinh: tốn giờ và thiếu nhất quán. Cách né: mọi văn bản làm quá 2 lần đều phải có mẫu chuẩn.

Bộ tài liệu này AI tạo trong một phút. Bước tiếp theo đáng học là chuẩn hóa cả quy trình nhân sự và sổ sách bằng AI: từ tuyển dụng, giấy tờ đến báo cáo tự cập nhật.`,
    },
    courses: [
      { name: "AI Super Power", reason: "6 buổi tối tăng tốc việc giấy tờ, nhập liệu, văn bản bằng AI — khớp gap tốn giờ nhất của bạn." },
      { name: "AI Business System", reason: "Chuẩn hóa quy trình nhân sự và sổ sách thành hệ thống AI tự vận hành." },
    ],
    roadmapPhases: [
      "Prompt chuẩn cho JD, email, văn bản",
      "AI xử lý nhập liệu và đối soát",
      "Chuẩn hóa quy trình tuyển dụng + onboarding",
      "Báo cáo nhân sự / tài chính tự động",
      "Automation quy trình giấy tờ định kỳ",
    ],
  },

  creator: {
    id: "creator",
    label: "Content Creator",
    hook: "Nhập nghề của bạn. AI sẽ chỉ ra 10 việc bạn không cần tự làm nữa.",
    taskLibrary: [
      { id: "ytuong", label: "Tìm ý tưởng nội dung", aiSupportPct: 80, group: "quick_win" },
      { id: "script", label: "Viết hook + script", aiSupportPct: 85, group: "quick_win" },
      { id: "quaydung", label: "Quay dựng video", aiSupportPct: 65, group: "quick_win" },
      { id: "thumbnail", label: "Thumbnail / ảnh bìa", aiSupportPct: 75, group: "quick_win" },
      { id: "dakenh", label: "Đăng và tái sử dụng đa nền tảng", aiSupportPct: 80, group: "agent_automation" },
      { id: "phantich", label: "Phân tích nội dung hiệu quả", aiSupportPct: 70, group: "chuan_hoa_du_lieu" },
    ],
    goals: ["Ra nội dung đều không kiệt sức", "Tăng follow và view", "Kiếm tiền từ kênh", "Xây thương hiệu cá nhân"],
    painPoints: [
      "Cạn ý tưởng, sợ ngày mai đăng gì",
      "Sản xuất một video mất cả ngày",
      "Kênh tăng chậm không rõ vì sao",
      "Không kịp làm đa nền tảng",
      "Thu nhập từ kênh chưa ổn định",
      "Ngại lên hình, muốn làm faceless",
    ],
    scaleQuestion: {
      label: "Kênh của bạn đang ở đâu?",
      options: ["Chưa có kênh", "Dưới 10k follow", "10k-100k follow", "Trên 100k follow"],
    },
    agent: {
      name: "AI Viral Content Creator",
      intro: "Tôi đã tạo sẵn AI Viral Creator cho bạn. Nhập chủ đề kênh, Agent tạo gói nội dung viral ngay.",
      inputLabel: "Chủ đề kênh + nền tảng chính",
      inputPlaceholder: "Ví dụ: Kênh chia sẻ về tài chính cá nhân cho người trẻ, chủ yếu TikTok",
      systemPrompt: `Bạn là AI Viral Content Creator cho creator Việt Nam. Từ chủ đề kênh người dùng nhập, hãy trả về đúng cấu trúc:
1. NĂM HOOK VIRAL: 5 câu mở đầu 3 giây cho chủ đề này, mỗi hook một cơ chế tâm lý khác nhau (tò mò, phản trực giác, mất mát, con số, câu chuyện).
2. MỘT SCRIPT 30 GIÂY HOÀN CHỈNH: chọn hook mạnh nhất, viết đủ hook - thân - CTA kèm chú thích khung hình.
3. SHOT LIST: các cảnh cần quay.
4. LỊCH TÁI SỬ DỤNG ĐA KÊNH: cách biến 1 video thành 4-5 mẩu nội dung cho nền tảng khác.
${AGENT_BASE_RULES}`,
      fallbackOutput: `**NĂM HOOK VIRAL (chủ đề tài chính cá nhân, minh họa)**
1. Tò mò: "Có một khoản tiền bạn đang mất mỗi tháng mà không hề biết."
2. Phản trực giác: "Tiết kiệm không làm bạn giàu. Nghe vô lý nhưng xem hết đã."
3. Mất mát: "Mỗi năm trì hoãn đầu tư, bạn trả giá nhiều hơn bạn nghĩ."
4. Con số: "Thu nhập 10 triệu vẫn để dành được. Đây là cách chia."
5. Câu chuyện: "Năm 22 tuổi mình cháy túi. Một thói quen này thay đổi tất cả."

**SCRIPT 30 GIÂY (hook số 4)**
- 0-3s (mặt nói trực diện, chữ to): "Thu nhập 10 triệu vẫn để dành được. Đây là cách chia."
- 3-10s (b-roll ví tiền, app ngân hàng): "Sai lầm lớn nhất là để hết tiền một chỗ rồi tiêu đến đâu hay đến đó."
- 10-22s (đồ họa chia 3 cột): "Ngay ngày nhận lương, chia làm ba: chi tiêu bắt buộc, quỹ an toàn, và một phần cho việc học kỹ năng tăng thu nhập. Con số bao nhiêu tùy hoàn cảnh, nguyên tắc là chia trước khi tiêu."
- 22-30s (mặt nói + chữ CTA): "Bạn đang chia thế nào? Comment thử, video sau mình phân tích các cách chia phổ biến."

**SHOT LIST**
- Cảnh mặt nói trực diện đủ sáng (hook + CTA)
- B-roll: mở app ngân hàng, cầm ví, ghi sổ
- Đồ họa 3 cột (làm bằng công cụ AI hoặc CapCut)

**TÁI SỬ DỤNG ĐA KÊNH**
- Cắt hook thành video 10 giây teaser cho kênh phụ.
- Chuyển script thành bài viết Facebook kèm hình đồ họa.
- Ghép 5 video cùng chủ đề thành 1 video dài YouTube.
- Trích quote mạnh nhất làm ảnh đăng story.
- Gom comment hay làm video phản hồi tiếp theo.

**CHI PHÍ CƠ HỘI BẠN ĐANG MẤT MỖI THÁNG**
Kênh của creator lớn theo số lần được thuật toán "cho thử":
- Sản lượng: làm tay 3-4 video/tuần = 15 lượt thử/tháng; có AI hỗ trợ cả dây chuyền có thể ra 1-2 video/ngày = 30-60 lượt thử. Xác suất có video trăm nghìn view tăng theo cấp số — mỗi video viral hụt là hàng nghìn follow và các hợp đồng booking lỡ mất (ước tính minh họa, không phải cam kết).
- Trend: sóng trend chỉ sống 24-48 giờ; sản xuất mất 2 ngày/video là vĩnh viễn đi sau người ra video trong 2 giờ.
- Đa nền tảng: mỗi video chỉ đăng 1 nơi là bỏ phí 3-4 nền tảng khác — cùng công sức đó, người biết tái sử dụng nội dung có lượng tiếp cận gấp nhiều lần.

**VIỆC LÀM NGAY TRONG 7 NGÀY**
- Ngày 1: dùng AI tạo ngân hàng 30 ý tưởng cho chủ đề kênh của bạn, chấm điểm và giữ lại 10 ý mạnh nhất.
- Ngày 2-4: mỗi ngày sản xuất 1 video theo đúng cấu trúc script ở trên (hook - thân - CTA), đăng cùng khung giờ.
- Ngày 5: xem lại số liệu: hook nào giữ chân qua giây 3 tốt nhất, chủ đề nào có lượt chia sẻ — đó là công thức của kênh bạn.
- Ngày 6-7: lấy video tốt nhất, tái sử dụng thành 4 định dạng khác theo lịch đa kênh ở trên.

**3 LỖI CREATOR THƯỜNG GẶP**
- Đổi phong cách liên tục vì sốt ruột: người xem không kịp nhớ bạn là ai. Cách né: giữ 1 định dạng chủ lực ít nhất 1 tháng.
- Dùng AI viết script rồi đọc nguyên văn: mất chất giọng riêng — thứ duy nhất đối thủ không sao chép được. Cách né: AI viết khung, bạn kể lại bằng lời của mình.
- Chỉ nhìn view, không nhìn tỷ lệ giữ chân: view ảo không xây được kênh. Cách né: mỗi tuần rà 3 chỉ số: giữ chân 3 giây, xem hết, chia sẻ.

Gói nội dung này AI tạo trong một phút. Bước tiếp theo đáng học là xây dây chuyền nội dung: AI tìm ý tưởng, viết script, dựng video và phân tích số liệu cho cả tuần chỉ trong một buổi.`,
    },
    courses: [
      { name: "Siêu Trợ Lý Nhân Hiệu", reason: "Xây nhân hiệu bài bản với AI làm trợ lý sản xuất nội dung — khớp gap phát triển kênh." },
      { name: "AI Super Power", reason: "6 buổi tối làm chủ công cụ AI tạo nội dung viral và tăng tốc cả dây chuyền sản xuất." },
    ],
    roadmapPhases: [
      "Ngân hàng ý tưởng + hook bằng AI",
      "Script video AI mỗi ngày",
      "Dây chuyền quay dựng tinh gọn",
      "Tái sử dụng đa nền tảng tự động",
      "AI Agent phân tích và đề xuất nội dung",
    ],
  },
};

export const PERSONA_LIST = Object.values(PERSONAS);

// Link đăng ký thật của từng chương trình. Chưa có link riêng thì fallback về taki.vn.
// Danh mục 4 chương trình đang mở bán (đã rút gọn theo chỉ đạo)
export const COURSE_URLS: Record<string, string> = {
  "AI Super Power": "https://aisuperpower.taki.vn/",
  "AI Business System": "https://aibusiness.nguyentatkiem.com/aiagent",
  "Siêu Trợ Lý Nhân Hiệu": "https://brandup.taki.vn/",
  "AI Scale Up Coaching": "https://aiscaleupcoaching.taki.vn/",
};

export const COURSE_FALLBACK_URL = "https://taki.vn";

export function courseUrl(name: string): string {
  return COURSE_URLS[name] ?? COURSE_FALLBACK_URL;
}

export const AI_TOOL_OPTIONS = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Canva AI",
  "CapCut AI",
  "Midjourney / tạo ảnh AI",
  "Công cụ tạo video AI",
  "n8n / Make / Zapier",
  "Notion AI",
  "Khác",
];
