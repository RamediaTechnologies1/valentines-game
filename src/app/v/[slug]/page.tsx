import type { Metadata } from "next";
import { queryOne } from "@/lib/db";
import ExperiencePage from "./ExperiencePage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const data = await queryOne<{ from_name: string; to_name: string; photos: { url: string }[] }>(
    "SELECT from_name, to_name, photos FROM experiences WHERE slug = $1",
    [slug]
  );

  if (!data) {
    return {
      title: "LoveScroll — Experience Not Found",
      description: "This love story may have expired or doesn't exist.",
    };
  }

  const title = `${data.from_name} made something special for ${data.to_name} 💕`;
  const description = "Open to experience a beautiful journey through your memories together.";
  const firstPhoto = data.photos?.[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "LoveScroll by Ramedia",
      ...(firstPhoto && { images: [{ url: firstPhoto, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: firstPhoto ? "summary_large_image" : "summary",
      title,
      description,
    },
    robots: { index: false, follow: false },
  };
}

export default function Page() {
  return <ExperiencePage />;
}
