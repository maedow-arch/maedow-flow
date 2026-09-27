import "./globals.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/site";
import { TRADUCTIONS } from "@/lib/traductions";

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
    <html lang="fr" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider i18n={{ locale: "fr", translations: TRADUCTIONS }}>{children}</RootProvider>
      </body>
    </html>
  );
}
