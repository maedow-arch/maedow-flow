import Link from "next/link";
import { FullSearchTrigger, SearchTrigger } from "fumadocs-ui/layouts/shared/slots/search-trigger";
import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch";
import { BlocTexte } from "@/components/BlocTexte";
import { DefilementDoux } from "@/components/DefilementDoux";
import { GithubIcon } from "@/components/GithubIcon";
import { Logo, LogoMark } from "@/components/Logo";
import { NavbarCondensee } from "@/components/NavbarCondensee";
import { Scene } from "@/components/Scene";
import { SceneHero } from "@/components/SceneHero";
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
        Une barre propre à l'accueil, comme chez Maedow Arch : elle s'anime à
        l'entrée et laisse voir la trame tant que rien ne passe dessous. Les
        rôles d'animation sont portés par des enveloppes neutres, jamais par les
        liens eux-mêmes : leurs transitions CSS de survol intercepteraient les
        valeurs que GSAP écrit, et l'élément sauterait à l'arrivée.
      */}
      <header
        data-navbar
        className="sticky top-0 z-40 border-b border-fd-border bg-fd-background/80 backdrop-blur transition-[background-color,backdrop-filter] duration-300"
      >
        <nav className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
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
          <section className="relative -mt-16 overflow-hidden border-b pt-16">
            <div data-hero="fond" aria-hidden="true" className="flow-dots flow-dots-fade pointer-events-none absolute inset-0" />
            <div className="relative mx-auto max-w-5xl px-4 pt-20 pb-16 sm:pt-28">
              <p
                data-hero="badge"
                className="inline-flex items-center gap-2 rounded-full border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground"
              >
                <LogoMark className="size-3.5 text-fd-primary" />
                Workflow de développement avec agents IA
              </p>
              <h1 data-hero="titre" className="mt-6 max-w-4xl text-4xl font-bold text-balance sm:text-6xl">
                Un agent code vite. <span className="text-fd-primary">Maedow Flow décide de l&apos;ordre des choses.</span>
              </h1>
              <p data-hero="promesse" className="mt-6 max-w-2xl text-lg text-pretty text-fd-muted-foreground">
                Ce qui se décide avant de coder, ce qui se prouve avant de fusionner, et ce qui ne se fait jamais. Pour
                des applications web, mobiles ou desktop qui tiennent en production, pas seulement en démonstration.
              </p>
              <div data-hero="actions" className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/docs/demarrer"
                  className="rounded-lg bg-fd-primary px-4 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90"
                >
                  Démarrer un projet
                </Link>
                <Link
                  href="/docs"
                  className="rounded-lg border bg-fd-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
                >
                  Lire le manifeste
                </Link>
              </div>

              <div data-hero="commande" className="flow-terminal mt-14 max-w-3xl">
                <BlocTexte titre="Prompt d'amorçage" texte={PROMPT_AMORCAGE} />
                <p className="mt-3 text-sm text-fd-muted-foreground">
                  Le premier message à ton agent, dans un dossier vide ou un projet existant : Claude Code, Cursor, Codex
                  ou tout agent qui dispose d&apos;un terminal.
                </p>
              </div>
            </div>
          </section>
        </SceneHero>

        <Scene className="mx-auto max-w-5xl px-4">
          <section className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CHIFFRES.map((c) => (
              <div key={c.libelle} data-anime="carte" className="rounded-xl border bg-fd-card p-4">
                <p className="font-heading text-4xl font-bold text-fd-primary">
                  <span data-anime="compte" data-valeur={c.valeur}>
                    {c.valeur}
                  </span>
                </p>
                <p className="mt-1 font-medium">{c.libelle}</p>
                <p className="mt-1 text-sm text-fd-muted-foreground">{c.detail}</p>
              </div>
            ))}
          </section>

          <section className="mt-20">
            <p className="text-sm font-semibold text-fd-primary">Le cycle</p>
            <h2 data-anime="titre" className="mt-2 text-3xl font-bold">
              Cinq phases, cinq portes
            </h2>
            <ol data-anime="cycle" className="mt-8 grid gap-3 sm:grid-cols-5">
              {PHASES.map((phase, i) => (
                <li
                  key={phase.nom}
                  data-anime="phase"
                  className="rounded-xl border bg-fd-card p-4 transition-colors hover:border-fd-primary"
                >
                  <span
                    data-anime="numero"
                    className="inline-flex size-6 items-center justify-center rounded-md bg-fd-primary font-mono text-xs font-semibold text-fd-primary-foreground"
                  >
                    {i}
                  </span>
                  <p className="font-heading mt-3 font-semibold">{phase.nom}</p>
                  <p className="mt-2 text-sm text-fd-muted-foreground">{phase.porte}</p>
                </li>
              ))}
            </ol>
            <p data-anime="intro" className="mt-6 text-fd-muted-foreground">
              Dix-sept règles codées <code>MF-001</code> à <code>MF-017</code>, chacune avec ce qui la fait respecter :
              un hook, la CI, un skill, ou la seule revue.{" "}
              <Link href="/docs/regles" className="font-medium text-fd-primary underline-offset-4 hover:underline">
                Lire les règles
              </Link>
            </p>
          </section>

          <section className="mt-20 grid gap-6 sm:grid-cols-2">
            <div data-anime="carte" className="rounded-xl border bg-fd-card p-6">
              <h2 className="text-lg font-bold">Avec Claude Code</h2>
              <BlocTexte
                className="mt-4"
                titre="Une fois par machine"
                texte={`/plugin marketplace add maedow-arch/maedow-flow#main
/plugin install maedow-flow@maedow-flow
npx skills add JavaScript-Mastery-Pro/skills`}
              />
              <p className="mt-4 text-sm text-fd-muted-foreground">
                Le skill <code>/flow</code> installe le kit, <code>/flow controler</code> vérifie qu&apos;un projet le
                respecte encore.
              </p>
            </div>
            <div data-anime="carte" className="rounded-xl border bg-fd-card p-6">
              <h2 className="text-lg font-bold">Avec un autre agent</h2>
              <BlocTexte
                className="mt-4"
                titre="Dans le dossier du projet"
                texte={`curl -fsSL https://maedow-flow.vercel.app/flow.mjs -o flow.mjs
node flow.mjs installer
rm flow.mjs`}
              />
              <p className="mt-4 text-sm text-fd-muted-foreground">
                Le même kit, sans plugin. Rien n&apos;est écrasé : ce qui existe reste en place.
              </p>
            </div>
          </section>

          <section className="mt-20">
            <p className="text-sm font-semibold text-fd-primary">Pour les agents</p>
            <h2 data-anime="titre" className="mt-2 text-3xl font-bold">
              Tout le site, en texte brut
            </h2>
            <p data-anime="intro" className="mt-3 text-fd-muted-foreground">
              Dérivé du même corpus à chaque publication.
            </p>
            <ul className="mt-6 divide-y overflow-hidden rounded-xl border bg-fd-card">
              {AGENTS.map((a) => (
                <li key={a.url} data-anime="carte" className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:gap-4">
                  <a href={a.url} className="font-mono text-sm font-medium text-fd-primary underline-offset-4 hover:underline">
                    {a.url}
                  </a>
                  <span className="text-sm text-fd-muted-foreground">{a.role}</span>
                </li>
              ))}
            </ul>
          </section>

          <footer className="mt-24 mb-10 flex flex-col gap-3 border-t pt-6 text-sm text-fd-muted-foreground sm:flex-row sm:items-center sm:justify-between">
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
