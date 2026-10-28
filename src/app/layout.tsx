import type { Metadata } from "next";
import { Archivo_Black, Manrope } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const display = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const SITE_URL = "https://cadeflavinho.com.br";
const OG_IMAGE = {
  url: "/og-share.jpg?v=3",
  width: 1200,
  height: 1200,
  alt: "Cadê Flavinho? — ilustração satírica / caricatura ficcional",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Cadê Flavinho?",
  description:
    "Jogo satírico de humor: ache o Flavinho na multidão antes do tempo zerar. Grátis — cadeflavinho.com.br",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Cadê Flavinho?",
    description:
      "Jogo satírico: ache o Flavinho na multidão. Grátis — cadeflavinho.com.br",
    url: SITE_URL,
    siteName: "Cadê Flavinho",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cadê Flavinho?",
    description:
      "Jogo satírico e grátis. Você consegue achar ele? cadeflavinho.com.br",
    images: [OG_IMAGE.url],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
