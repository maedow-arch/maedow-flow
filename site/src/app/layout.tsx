import "./globals.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Geist_Mono, Google_Sans_Code, Google_Sans_Flex, Space_Grotesk } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/site";
import { TRADUCTIONS } from "@/lib/traductions";

/*
 * Les quatre fontes de Maedow Arch, chargées à l'identique. `next/font/google`
 * les auto-héberge au build : aucune requête vers un domaine tiers, aucun
 * décalage de mise en page au chargement.
 *
 * Les deux Google Sans sont trop récentes pour la table de métriques dont Next
 * se sert pour calibrer une police de repli : on nomme le repli nous-mêmes.
 */
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});

const googleSansCode = Google_Sans_Code({
  subsets: ["latin"],
  variable: "--font-mono-code",
  display: "swap",
  axes: ["MONO"],
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-snippet-face", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Maedow Flow",
    default: "Maedow Flow, construire des applications solides avec des agents IA",
  },
  description:
    "Un workflow de développement pour agents IA : ce qui se décide avant de coder, ce qui se prouve avant de fusionner, et ce qui ne se fait jamais. Web, mobile, desktop.",
  alternates: {
    canonical: "/",
    // Les agents qui découvrent le site par son HTML trouvent ici la version texte.
    types: { "text/plain": "/llms.txt" },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Maedow Flow",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${googleSansFlex.variable} ${googleSansCode.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider
          i18n={{ locale: "fr", translations: TRADUCTIONS }}
          theme={{ defaultTheme: "dark", enableSystem: false }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
