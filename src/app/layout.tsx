import type { Metadata } from "next";
import { Cairo, Amiri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "جلال بيو | منتجات مغربية طبيعية أصيلة",
  description:
    "متجر إلكتروني لبيع الزيت، العسل، التين المجفف، الزيتون المخلل، الخليع المغربي، العنب المشكل، وزبدة البقر الطبيعية. منتجات أصيلة من قلب المغرب.",
  keywords: [
    "زيت",
    "عسل",
    "تين مجفف",
    "زيتون مخلل",
    "خليع مغربي",
    "عنب",
    "زبدة البقر",
    "منتجات مغربية",
    "Moroccan products",
    "honey",
    "olive oil",
  ],
  authors: [{ name: "جلال بيو" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "جلال بيو | منتجات مغربية طبيعية أصيلة",
    description:
      "زيت، عسل، تين مجفف، زيتون مخلل، خليع مغربي، عنب مشكل، زبدة البقر. منتجات طبيعية 100%.",
    type: "website",
    locale: "ar_MA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${amiri.variable} font-cairo antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
