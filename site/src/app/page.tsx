import Link from "next/link";
import { FullSearchTrigger, SearchTrigger } from "fumadocs-ui/layouts/shared/slots/search-trigger";
import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch";
import { DefilementDoux } from "@/components/DefilementDoux";
import { GithubIcon } from "@/components/GithubIcon";
import { Logo } from "@/components/Logo";
import { NavbarCondensee } from "@/components/NavbarCondensee";
import { Scene } from "@/components/Scene";
import { SceneHero } from "@/components/SceneHero";
import { TerminalWindow } from "@/components/TerminalWindow";
import chiffres from "@/lib/chiffres.json";
import { ARCH_URL, PROMPT_AMORCAGE, REPO_URL, SKILLS_URL } from "@/lib/site";

const PHASES = [
  { nom: "Cadrer", porte: "Chaque feature tient en une intention et une ligne « Fini quand »." },
  { nom: "Fonder", porte: "Un projet vide passe verify, en local et en CI." },
  { nom: "Construire", porte: "Chaque critère d'acceptation est constaté sur l'application qui tourne." },
  { nom: "Livrer", porte: "Les parcours critiques sont vérifiés, aucun constat critique n'est ouvert." },
  { nom: "Exploiter", porte: "On mesure avant d'ajouter la moindre brique." },
];

/* Les chiffres viennent de src/lib/chiffres.json, dénombré dans le dépôt par scripts/sync.mjs. */
const CHIFFRES = [
  { valeur: chiffres.regles, libelle: "règles codées", detail: "de MF-001 à MF-017, chacune avec ce qui la fait respecter" },
  { valeur: chiffres.phases, libelle: "phases", detail: "chacune fermée par une porte vérifiable" },
  { valeur: chiffres.paliers, libelle: "paliers d'exigence", detail: "du prototype à la production" },
  { valeur: chiffres.fichiers, libelle: "fichiers dans le kit", detail: "installés sans rien écraser" },
];

const AGENTS = [
  { url: "/llms.txt", role: "l'index, au format llmstxt.org" },
  { url: "/llms-full.txt", role: "le corpus entier, en un seul fichier texte" },
  { url: "/md/regles.md", role: "chaque page en Markdown brut, ici les règles" },
  { url: "/templates/manifest.json", role: "le kit : chaque fichier et sa destination" },
  { url: "/flow.mjs", role: "le script d'installation, sans dépendance" },
];

export default function Accueil() {
  return (
    <>
      <DefilementDoux />
      <NavbarCondensee />

      {/*
        La barre de l'accueil : transparente en haut de page, fond et bordure
        au défilement. Les rôles d'animation sont portés par des enveloppes
        neutres, jamais par les liens eux-mêmes.
      */}
      <header
        data-navbar
        className="sticky top-0 z-40 border-b border-fd-border bg-fd-background/80 backdrop-blur transition-[background-color,backdrop-filter,border-color] duration-300"
      >
        <nav className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <span data-navbar-marque className="inline-flex">
            <Link href="/" aria-label="Maedow Flow, accueil" className="text-fd-foreground">
              <Logo />
            </Link>
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span data-navbar-action className="inline-flex">
              <FullSearchTrigger className="hidden w-56 md:flex" />
              <SearchTrigger className="md:hidden" />
            </span>
            <span data-navbar-action className="inline-flex">
              <ThemeSwitch mode="light-dark" />
            </span>
            <span data-navbar-action className="inline-flex">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Dépôt GitHub"
                className="rounded-md p-2 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
              >
                <GithubIcon className="size-4" />
              </a>
            </span>
            <span data-navbar-action className="inline-flex">
              <Link
                href="/docs"
                className="rounded-lg bg-fd-primary px-3 py-2 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90 sm:px-4"
              >
                <span className="sm:hidden">Docs</span>
                <span className="max-sm:hidden">Documentation</span>
              </Link>
            </span>
          </div>
        </nav>
      </header>

      <main className="w-full flex-1">
        <SceneHero>
          <section className="relative -mt-14 overflow-hidden border-b border-fd-border pt-14">
            <div data-hero="fond" aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0" />
            <div className="relative mx-auto max-w-5xl px-4 pt-24 pb-20 sm:pt-32">
              <p data-hero="badge" className="font-mono text-xs text-fd-muted-foreground">
                <span className="text-fd-primary">{"//"}</span> workflow de développement avec agents IA
              </p>
              <h1 data-hero="titre" className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
                Un agent code vite.{" "}
                <span className="text-fd-primary">Maedow Flow décide de l&apos;ordre des choses.</span>
              </h1>
              <p data-hero="promesse" className="mt-6 max-w-2xl text-lg text-pretty text-fd-muted-foreground">
                Ce qui se décide avant de coder, ce qui se prouve avant de fusionner, et ce qui ne se fait jamais. Pour
                des applications web, mobiles ou desktop qui tiennent en production, pas seulement en démonstration.
              </p>

              <div data-hero="commande" className="mt-10 max-w-3xl">
                <TerminalWindow title="prompt.sh" code={PROMPT_AMORCAGE} />
                <p className="mt-3 text-sm text-fd-muted-foreground">
                  Le premier message à ton agent, dans un dossier vide ou un projet existant : Claude Code, Cursor, Codex
                  ou tout agent qui dispose d&apos;un terminal.
                </p>
              </div>

              <div data-hero="actions" className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href="/docs/demarrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-fd-foreground transition-colors hover:text-fd-primary"
                >
                  Démarrer un projet
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/docs"
                  className="text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                >
                  Lire le manifeste
                </Link>
              </div>
            </div>
          </section>
        </SceneHero>

        <Scene className="mx-auto max-w-5xl px-4">
          {/* Chiffres */}
          <section className="mt-16 grid grid-cols-2 divide-x divide-y divide-fd-border overflow-hidden rounded-xl border border-fd-border sm:grid-cols-4 sm:divide-y-0">
            {CHIFFRES.map((c) => (
              <div key={c.libelle} data-anime="carte" className="p-5">
                <p className="font-heading text-4xl font-bold text-fd-primary sm:text-5xl">
                  <span data-anime="compte" data-valeur={c.valeur}>
                    {c.valeur}
                  </span>
                </p>
                <p className="mt-2 text-sm font-medium text-fd-foreground">{c.libelle}</p>
                <p className="mt-1 text-xs text-fd-muted-foreground">{c.detail}</p>
              </div>
            ))}
          </section>

          {/* Cycle */}
          <section className="mt-20">
            <p className="font-mono text-xs text-fd-muted-foreground">
              <span className="text-fd-primary">{"//"}</span> le cycle
            </p>
            <h2 data-anime="titre" className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Cinq phases, cinq portes
            </h2>
            <div
              data-anime="cycle"
              className="mt-8 grid grid-cols-1 divide-y divide-fd-border overflow-hidden rounded-xl border border-fd-border sm:grid-cols-5 sm:divide-x sm:divide-y-0"
            >
              {PHASES.map((phase, i) => (
                <div key={phase.nom} data-anime="phase" className="p-5">
                  <span
                    data-anime="numero"
                    className="inline-flex size-7 items-center justify-center rounded-md border border-fd-border font-mono text-xs font-semibold text-fd-primary"
                  >
                    {i}
                  </span>
                  <p className="font-heading mt-3 font-semibold text-fd-foreground">{phase.nom}</p>
                  <p className="mt-2 text-sm text-fd-muted-foreground">{phase.porte}</p>
                </div>
              ))}
            </div>
            <p data-anime="intro" className="mt-6 text-fd-muted-foreground">
              Dix-sept règles codées <code>MF-001</code> à <code>MF-017</code>, chacune avec ce qui la fait respecter : un
              hook, la CI, un skill, ou la seule revue.{" "}
              <Link href="/docs/regles" className="font-medium text-fd-primary underline-offset-4 hover:underline">
                Lire les règles →
              </Link>
            </p>
          </section>

          {/* Installation */}
          <section className="mt-20 grid gap-6 sm:grid-cols-2">
            <div data-anime="carte" className="flex flex-col gap-4">
              <div>
                <p className="font-mono text-xs text-fd-muted-foreground">
                  <span className="text-fd-primary">{"//"}</span> avec Claude Code
                </p>
                <h3 className="mt-1 text-lg font-bold text-fd-foreground">Une fois par machine</h3>
              </div>
              <TerminalWindow
                title="terminal"
                code={`/plugin marketplace add maedow-arch/maedow-flow#main
/plugin install maedow-flow@maedow-flow
npx skills add JavaScript-Mastery-Pro/skills`}
              />
              <p className="text-sm text-fd-muted-foreground">
                Le skill <code>/flow</code> installe le kit, <code>/flow controler</code> vérifie qu&apos;un projet le
                respecte encore.
              </p>
            </div>
            <div data-anime="carte" className="flex flex-col gap-4">
              <div>
                <p className="font-mono text-xs text-fd-muted-foreground">
                  <span className="text-fd-primary">{"//"}</span> avec un autre agent
                </p>
                <h3 className="mt-1 text-lg font-bold text-fd-foreground">Dans le dossier du projet</h3>
              </div>
              <TerminalWindow
                title="terminal"
                code={`curl -fsSL https://maedow-flow.vercel.app/flow.mjs -o flow.mjs
node flow.mjs installer
rm flow.mjs`}
              />
              <p className="text-sm text-fd-muted-foreground">
                Le même kit, sans plugin. Rien n&apos;est écrasé : ce qui existe reste en place.
              </p>
            </div>
          </section>

          {/* Agents */}
          <section className="mt-20">
            <p className="font-mono text-xs text-fd-muted-foreground">
              <span className="text-fd-primary">{"//"}</span> pour les agents
            </p>
            <h2 data-anime="titre" className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Tout le site, en texte brut
            </h2>
            <p data-anime="intro" className="mt-3 text-fd-muted-foreground">
              Dérivé du même corpus à chaque publication.
            </p>
            <div className="mt-6 overflow-hidden rounded-xl border border-fd-border">
              {AGENTS.map((a, i) => (
                <a
                  key={a.url}
                  href={a.url}
                  data-anime="carte"
                  className={`flex flex-col gap-1 p-4 transition-colors hover:bg-fd-accent sm:flex-row sm:items-baseline sm:gap-4 ${
                    i < AGENTS.length - 1 ? "border-b border-fd-border" : ""
                  }`}
                >
                  <span className="font-mono text-sm font-medium text-fd-primary">{a.url}</span>
                  <span className="text-sm text-fd-muted-foreground">{a.role}</span>
                </a>
              ))}
            </div>
          </section>

          {/* Pied de page */}
          <footer className="mt-24 mb-10 flex flex-col gap-3 border-t border-fd-border pt-6 text-sm text-fd-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span data-anime="colonne" className="inline-flex">
              <Logo className="text-fd-foreground" />
            </span>
            <p data-anime="colonne">
              Le moteur : les skills de{" "}
              <a href={SKILLS_URL} className="underline underline-offset-4">
                JavaScript-Mastery-Pro
              </a>
              . L&apos;architecture du code :{" "}
              <a href={ARCH_URL} className="underline underline-offset-4">
                Maedow Arch
              </a>
              . Licence MIT.
            </p>
          </footer>
        </Scene>
      </main>
    </>
  );
}
