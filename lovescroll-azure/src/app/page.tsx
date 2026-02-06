import { redirect } from "next/navigation";

export default function Home() {
  redirect(process.env.NEXT_PUBLIC_WP_URL || "https://ramedia.com");
}
