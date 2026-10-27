import type { Metadata } from "next";
import { Bangers, Nunito } from "next/font/google";
import "./globals.css";

const display = Bangers({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Onde Está Flavinho? | Jogo satírico",
  description:
    "Pistas estilo Carmem Sandiego + caça na multidão estilo Wally. Ache o Flavinho, compartilhe e apoie com PIX.",
  openGraph: {
    title: "Onde Está Flavinho?",
    description:
      "Jogo meme: descubra a cidade e ache o Flavinho na multidão cartoon.",
    images: ["/game/flavinho-sprite.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Onde Está Flavinho?",
    description: "Jogo meme viral. Ache o Flavinho.",
    images: ["/game/flavinho-sprite.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
