import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI X-RAY | Quét công việc. Tìm cơ hội AI.",
  description:
    "Bạn đang bỏ phí bao nhiêu tiền và bao nhiêu giờ mỗi tháng vì chưa dùng AI đúng cách? Quét miễn phí trong 2 phút, nhận AI Score và lộ trình AI cá nhân hóa.",
  openGraph: {
    title: "AI X-RAY | Quét công việc. Tìm cơ hội AI.",
    description:
      "Test miễn phí 2 phút: AI có thể thay bạn làm bao nhiêu % công việc? Nhận AI Score, bản đồ cơ hội AI hóa và lộ trình 30 ngày cá nhân hóa.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={`${montserrat.className} bg-nen text-navy-dark antialiased`}>
        {children}
      </body>
    </html>
  );
}
