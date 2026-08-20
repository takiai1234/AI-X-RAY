import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Pixels from "@/components/Pixels";
import { getSettings } from "@/lib/settings";

// Render động để nội dung/pixel chỉnh từ /admin áp dụng ngay, không cần build lại
export const dynamic = "force-dynamic";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Title/description đọc từ settings — admin sửa được, áp dụng ngay
export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getSettings();
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  return (
    <html lang="vi">
      <body className={`${montserrat.className} bg-nen text-navy-dark antialiased`}>
        {children}
        <Pixels {...settings.pixels} />
      </body>
    </html>
  );
}
