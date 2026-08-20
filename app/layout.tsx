import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Pixels from "@/components/Pixels";
import { getSettings } from "@/lib/settings";
import { ogImageUrl } from "@/lib/ogImage";

// Render động để nội dung/pixel chỉnh từ /admin áp dụng ngay, không cần build lại
export const dynamic = "force-dynamic";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Title/description/ảnh share đọc từ settings — admin sửa được, áp dụng ngay
export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getSettings();
  const ogImg = await ogImageUrl();
  return {
    metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
    title: content.metaTitle,
    description: content.metaDescription,
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      ...(ogImg ? { images: [{ url: ogImg, width: 1200, height: 630 }] } : {}),
    },
    ...(ogImg ? { twitter: { card: "summary_large_image" as const } } : {}),
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
