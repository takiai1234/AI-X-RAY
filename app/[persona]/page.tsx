import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Funnel from "@/components/Funnel";
import { PERSONAS } from "@/lib/personas";
import { getSettings, toPublic } from "@/lib/settings";
import { ogImageUrl } from "@/lib/ogImage";
import type { PersonaId } from "@/lib/types";

// Landing riêng theo persona: /ceo, /seller, /office, /affiliate, /marketing, /sales, /hr, /creator
// Chạy ads theo tệp: mỗi tệp một URL + UTM, cùng một backend (mục 3 + 18).

const SUB_BRAND_TITLE: Record<string, string> = {
  ceo: "AI X-RAY Business",
  seller: "AI X-RAY Seller",
  office: "AI X-RAY Office",
  affiliate: "AI X-RAY Affiliate",
  marketing: "AI X-RAY Marketing",
  sales: "AI X-RAY Sales",
  hr: "AI X-RAY HR",
  creator: "AI X-RAY Creator",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ persona: string }>;
}): Promise<Metadata> {
  const { persona } = await params;
  const p = PERSONAS[persona];
  if (!p) return {};
  const settings = await getSettings();
  const hook = settings.personaHooks[persona] || p.hook;
  const title = `${SUB_BRAND_TITLE[persona]} | ${hook}`;
  const description = `Dành riêng cho ${p.label}: quét công việc trong 2 phút, nhận AI Score, số giờ có thể tối ưu và lộ trình AI 30 ngày cá nhân hóa. Miễn phí.`;
  const ogImg = await ogImageUrl();
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogImg ? { images: [{ url: ogImg, width: 1200, height: 630 }] } : {}),
    },
  };
}

export default async function PersonaPage({
  params,
}: {
  params: Promise<{ persona: string }>;
}) {
  const { persona } = await params;
  if (!PERSONAS[persona]) notFound();
  const settings = await getSettings();
  return (
    <Funnel personaLock={persona as PersonaId} settings={toPublic(settings)} />
  );
}
