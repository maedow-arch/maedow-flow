import Link from "next/link";
import { FullSearchTrigger, SearchTrigger } from "fumadocs-ui/layouts/shared/slots/search-trigger";
import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch";
import { BlocTexte } from "@/components/BlocTexte";
import { DefilementDoux } from "@/components/DefilementDoux";
import { Faq } from "@/components/Faq";
import { GithubIcon } from "@/components/GithubIcon";
import { Logo, LogoMark } from "@/components/Logo";
import { NavbarCondensee } from "@/components/NavbarCondensee";
import { Scene } from "@/components/Scene";
import { SceneHero } from "@/components/SceneHero";
import { SectionBadge } from "@/components/SectionBadge";
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

/* Ce que dit le manifeste : livré à lui-même, un agent dérive de trois façons. */
const PROBLEME = [
  { titre: "Décisions inventées", texte: "Un agent livré à lui-même invente les décisions qu'on ne lui a pas données." },
  { titre: "Périmètre qui s'élargit", texte: "Il élargit le périmètre au passage, et déclare fini ce qu'il n'a pas vérifié." },
  { titre: "Mémoire perdue", texte: "Il oublie d'une session à l'autre ce qui avait été tranché, et le résultat casse en production." },
];

/* La table « Ce que Maedow Flow réunit » du manifeste, une brique par page du corpus. */
const BRIQUES = [
  { nom: "Le cycle", apporte: "Les phases, les portes à franchir et le palier d'exigence de chaque feature.", url: "/docs/cycle" },
  { nom: "Les règles", apporte: "Dix-sept règles codées MF-001 à MF-017, chacune avec ce qui la fait respecter.", url: "/docs/regles" },
  { nom: "Le moteur", apporte: "Les skills /scope, /architect, /develop, /check, /test, /debug, /sync, /audit, /document.", url: "/docs/claude-code" },
  { nom: "Le kit", apporte: "AGENTS.md, garde-fous Claude Code, hooks git, CI GitHub, installés par /flow.", url: "/docs/demarrer" },
  { nom: "Les profils", apporte: "Les stacks par défaut pour le web, le mobile et le desktop.", url: "/docs/plateformes" },
  { nom: "Les socles", apporte: "La sécurité minimale, et ce qu'il faut pour ne pas tomber sous la charge.", url: "/docs/securite" },
  { nom: "Les prompts", apporte: "Les formulations éprouvées pour chaque moment du cycle.", url: "/docs/prompts" },
];

const OUTILS = ["Claude Code", "Cursor", "Codex", "tout agent avec un terminal"];

const AGENTS = [
  { url: "/llms.txt", role: "l'index, au format llmstxt.org" },
  { url: "/llms-full.txt", role: "le corpus entier, en un seul fichier texte" },
  { url: "/md/regles.md", role: "chaque page en Markdown brut, ici les règles" },
  { url: "/templates/manifest.json", role: "le kit : chaque fichier et sa destination" },
  { url: "/flow.mjs", role: "le script d'installation, sans dépendance" },
];

/* Des réponses réelles, reformulées en question : le manifeste et le README, jamais inventés. */
const QUESTIONS = [
  {
    question: "Maedow Flow choisit-il la stack à ma place ?",
    reponse:
      "Non. Ce n'est pas un générateur d'application : il fournit des défauts éprouvés que /architect discute projet par projet.",
  },
  {
    question: "Remplace-t-il les skills de Claude Code ?",
    reponse:
      "Non. Les skills de JavaScript-Mastery-Pro sont le moteur ; Maedow Flow les ordonne et comble ce qu'ils ne couvrent pas : les règles non négociables, les garde-fous mécaniques, les défauts de plateforme.",
  },
  {
    question: "Les règles sont-elles figées ?",
    reponse:
      "Non. Une règle qui résiste à la réalité se corrige, et la correction prend une ligne au CHANGELOG.md qui dit pourquoi.",
  },
  {
    question: "Qui décide, l'agent ou moi ?",
    reponse:
      "Toi. Le product owner (l'humain) décide du produit, valide le scope et les specs, et fusionne les pull requests ; l'agent cadre ou construit, mais ne tranche pas à ta place.",
  },
  {
    question: "Le site peut-il se périmer par rapport au corpus ?",
    reponse:
      "Non. Tout ce qu'il affiche est dérivé de corpus/*.md par site/scripts/sync.mjs à chaque publication ; rien n'est recopié à la main.",
  },
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
            <div aria-hidden="true" className="flow-glow pointer-events-none absolute inset-0" />
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

        {/* Barre d'outils : les agents avec lesquels le kit s'installe, sans plugin propriétaire. */}
        <section className="border-b bg-fd-card/40">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-6 text-sm text-fd-muted-foreground sm:flex-row">
            <span className="shrink-0 font-medium text-fd-foreground">Le kit s&apos;installe avec</span>
            <span className="hidden h-4 w-px shrink-0 bg-fd-border sm:inline-flex" aria-hidden="true" />
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-start">
              {OUTILS.map((outil) => (
                <li key={outil} className="font-heading font-semibold tracking-tight text-fd-foreground/80">
                  {outil}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Scene className="w-full">
          <section className="mx-auto max-w-5xl px-4">
            <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            </div>
          </section>

          {/* Le problème, tel que le manifeste le pose : trois façons dont un agent livré à lui-même dérive. */}
          <section className="mx-auto max-w-5xl px-4">
            <div className="mt-24">
              <SectionBadge>Le problème</SectionBadge>
              <h2 data-anime="titre" className="mt-4 max-w-2xl text-3xl font-bold">
                Un agent livré à lui-même dérive
              </h2>
              <p data-anime="intro" className="mt-4 max-w-2xl text-fd-muted-foreground">
                Un agent IA écrit du code plus vite que n&apos;importe qui. Sans garde-fou, le résultat tient en
                démonstration et casse en production.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {PROBLEME.map((p) => (
                  <div key={p.titre} data-anime="carte" className="rounded-xl border bg-fd-card p-5">
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-fd-foreground text-fd-background">
                      <LogoMark className="size-4" />
                    </span>
                    <p className="font-heading mt-4 font-semibold">{p.titre}</p>
                    <p className="mt-2 text-sm text-fd-muted-foreground">{p.texte}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/*
            Cinq phases, cinq portes : la réponse au problème, en bande sombre
            pleine largeur — le seul rythme visuel de la page qui casse le
            conteneur, parce que c'est l'idée qui porte tout le reste.
          */}
          <section className="mt-24 border-y bg-fd-card">
            <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
              <div>
                <SectionBadge>La réponse</SectionBadge>
                <h2 data-anime="titre" className="mt-4 text-3xl font-bold">
                  Cinq phases, cinq portes
                </h2>
                <p data-anime="intro" className="mt-4 text-fd-muted-foreground">
                  Dix-sept règles codées <code>MF-001</code> à <code>MF-017</code>, chacune avec ce qui la fait
                  respecter : un hook, la CI, un skill, ou la seule revue.
                </p>
                <Link
                  href="/docs/regles"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-fd-primary underline-offset-4 hover:underline"
                >
                  Lire les règles →
                </Link>
              </div>
              <ol data-anime="cycle" className="flex flex-col gap-3">
                {PHASES.map((phase, i) => (
                  <li
                    key={phase.nom}
                    data-anime="phase"
                    className="flex items-start gap-4 rounded-xl border bg-fd-background p-4 transition-colors hover:border-fd-primary"
                  >
                    <span
                      data-anime="numero"
                      className="font-heading shrink-0 text-2xl font-bold text-fd-primary tabular-nums"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-heading font-semibold">{phase.nom}</p>
                      <p className="mt-1 text-sm text-fd-muted-foreground">{phase.porte}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Ce que le manifeste réunit : les sept briques du corpus, en grille de capacités. */}
          <section className="mx-auto max-w-5xl px-4">
            <div className="mt-24">
              <SectionBadge>Capacités</SectionBadge>
              <h2 data-anime="titre" className="mt-4 max-w-2xl text-3xl font-bold">
                Ce que Maedow Flow réunit
              </h2>
              <p data-anime="intro" className="mt-4 max-w-2xl text-fd-muted-foreground">
                L&apos;architecture du code relève d&apos;un standard séparé,{" "}
                <a href={ARCH_URL} className="text-fd-primary underline-offset-4 hover:underline">
                  Maedow Arch
                </a>{" "}
                : Maedow Flow dit comment on travaille, Maedow Arch dit comment le code est rangé.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {BRIQUES.map((b) => (
                  <Link
                    key={b.nom}
                    href={b.url}
                    data-anime="carte"
                    className="group rounded-xl border bg-fd-card p-5 transition-colors hover:border-fd-primary"
                  >
                    <span className="inline-flex size-9 items-center justify-center rounded-lg border text-fd-primary transition-colors group-hover:bg-fd-primary group-hover:text-fd-primary-foreground">
                      <LogoMark className="size-4" />
                    </span>
                    <p className="font-heading mt-4 font-semibold">{b.nom}</p>
                    <p className="mt-2 text-sm text-fd-muted-foreground">{b.apporte}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4">
            <div className="mt-24 grid gap-6 sm:grid-cols-2">
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
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4">
            <div className="mt-24">
              <SectionBadge>Pour les agents</SectionBadge>
              <h2 data-anime="titre" className="mt-4 text-3xl font-bold">
                Tout le site, en texte brut
              </h2>
              <p data-anime="intro" className="mt-3 text-fd-muted-foreground">
                Dérivé du même corpus à chaque publication.
              </p>
              <ul className="mt-8 divide-y overflow-hidden rounded-xl border bg-fd-card">
                {AGENTS.map((a) => (
                  <li key={a.url} data-anime="carte" className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:gap-4">
                    <a href={a.url} className="font-mono text-sm font-medium text-fd-primary underline-offset-4 hover:underline">
                      {a.url}
                    </a>
                    <span className="text-sm text-fd-muted-foreground">{a.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Les questions, répondues avec les mots mêmes du manifeste et du README. */}
          <section className="mx-auto max-w-5xl px-4">
            <div className="mt-24">
              <SectionBadge>FAQ</SectionBadge>
              <h2 data-anime="titre" className="mt-4 text-3xl font-bold">
                Ce que Maedow Flow n&apos;est pas
              </h2>
              <p data-anime="intro" className="mt-3 max-w-2xl text-fd-muted-foreground">
                Les questions qui reviennent, répondues sans détour.
              </p>
              <div className="mt-8">
                <Faq items={QUESTIONS} />
              </div>
            </div>
          </section>

          {/* L'appel final, en bande sombre pleine largeur avec la même trame que l'ouverture. */}
          <section className="relative mt-24 overflow-hidden border-y bg-fd-card">
            <div aria-hidden="true" className="flow-dots pointer-events-none absolute inset-0 opacity-60" />
            <div className="relative mx-auto max-w-5xl px-4 py-16 text-center">
              <SectionBadge>Commencer</SectionBadge>
              <h2 data-anime="titre" className="font-heading mt-4 text-3xl font-bold sm:text-4xl">
                Prêt à cadrer ton prochain projet ?
              </h2>
              <p data-anime="intro" className="mx-auto mt-4 max-w-xl text-fd-muted-foreground">
                Le premier message à donner à ton agent, dans un dossier vide ou un projet existant.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/docs/demarrer"
                  className="rounded-lg bg-fd-primary px-4 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90"
                >
                  Démarrer un projet
                </Link>
                <Link
                  href="/docs"
                  className="rounded-lg border bg-fd-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
                >
                  Lire le manifeste
                </Link>
              </div>
            </div>
          </section>

          <footer className="mx-auto max-w-5xl px-4">
            <div className="mt-16 mb-10 grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
              <div data-anime="colonne">
                <Logo className="text-fd-foreground" />
                <p className="mt-3 max-w-xs text-sm text-fd-muted-foreground">
                  Un workflow de développement pour construire des applications solides avec des agents IA. Licence
                  MIT.
                </p>
              </div>
              <div data-anime="colonne">
                <p className="text-sm font-semibold">Le corpus</p>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-fd-muted-foreground">
                  <li>
                    <Link href="/docs" className="hover:text-fd-foreground">
                      Manifeste
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/demarrer" className="hover:text-fd-foreground">
                      Démarrer
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/cycle" className="hover:text-fd-foreground">
                      Cycle
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/regles" className="hover:text-fd-foreground">
                      Règles
                    </Link>
                  </li>
                </ul>
              </div>
              <div data-anime="colonne">
                <p className="text-sm font-semibold">Aller plus loin</p>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-fd-muted-foreground">
                  <li>
                    <Link href="/docs/claude-code" className="hover:text-fd-foreground">
                      Claude Code
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/plateformes" className="hover:text-fd-foreground">
                      Plateformes
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/securite" className="hover:text-fd-foreground">
                      Sécurité
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/echelle" className="hover:text-fd-foreground">
                      Tenir la charge
                    </Link>
                  </li>
                </ul>
              </div>
              <div data-anime="colonne">
                <p className="text-sm font-semibold">Ailleurs</p>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-fd-muted-foreground">
                  <li>
                    <a href={REPO_URL} className="hover:text-fd-foreground">
                      Dépôt GitHub
                    </a>
                  </li>
                  <li>
                    <a href={ARCH_URL} className="hover:text-fd-foreground">
                      Maedow Arch
                    </a>
                  </li>
                  <li>
                    <a href={SKILLS_URL} className="hover:text-fd-foreground">
                      Skills moteur
                    </a>
                  </li>
                  <li>
                    <a href="/llms-full.txt" className="hover:text-fd-foreground">
                      llms-full.txt
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div data-anime="colonne" className="flex flex-col gap-3 border-t pt-6 pb-6 text-sm text-fd-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>© {new Date().getFullYear()} Maedow Flow. Licence MIT.</span>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Dépôt GitHub"
                className="inline-flex items-center gap-1.5 hover:text-fd-foreground"
              >
                <GithubIcon className="size-4" />
                GitHub
              </a>
            </div>
          </footer>
        </Scene>
      </main>
    </>
  );
}
