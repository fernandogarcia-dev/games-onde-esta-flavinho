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

export const metadata: Metadata = {
  metadataBase: new URL("https://cadeflavinho.com.br"),
  title: "Cadê Flavinho?",
  description:
    "Jogo satírico: siga o rastro, marque o mapa e ache o Flavinho na multidão.",
  openGraph: {
    title: "Cadê Flavinho?",
    description: "Sumiu da agenda. Sobrou só o rastro.",
    url: "https://cadeflavinho.com.br",
    siteName: "Cadê Flavinho",
    images: ["/game/flavinho-sprite.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cadê Flavinho?",
    description: "Sumiu da agenda. Sobrou só o rastro.",
    images: ["/game/flavinho-sprite.jpg"],
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
