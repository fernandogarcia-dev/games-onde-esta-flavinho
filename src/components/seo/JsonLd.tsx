import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";

export function JsonLd() {
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${SITE_NAME}?`,
    alternateName: ["Cade Flavinho", "Cadê Flavinho jogo", "cadeflavinho"],
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    inLanguage: "pt-BR",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
    image: `${SITE_URL}${OG_IMAGE.url}`,
    screenshot: `${SITE_URL}${OG_IMAGE.url}`,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
    },
  };

  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_TITLE,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "pt-BR",
    potentialAction: {
      "@type": "PlayAction",
      target: SITE_URL,
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "O que é Cadê Flavinho?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Cadê Flavinho? é um jogo satírico grátis no navegador: você segue pistas, marca a cidade e acha o Flavinho escondido na multidão — com ranking mundial.",
        },
      },
      {
        "@type": "Question",
        name: "Cadê Flavinho é grátis?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim. O jogo é 100% gratuito. Qualquer PIX é apoio voluntário só para infraestrutura e custos do desenvolvedor.",
        },
      },
      {
        "@type": "Question",
        name: "Quais modos tem no Cadê Flavinho?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Três modos: O Mestre dos Disfarces (multidão), Rua da Amargura (Street View + mapa) e Diga-me com Quem Andas… (adivinhar o parça da fuga).",
        },
      },
      {
        "@type": "Question",
        name: "Precisa criar conta?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Não. Joga direto no navegador. No ranking você só escolhe um apelido único.",
        },
      },
    ],
  };

  const payloads = [webApp, webSite, faq];

  return (
    <>
      {payloads.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </>
  );
}
