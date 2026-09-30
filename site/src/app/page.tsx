import Link from "next/link";
import {
  FullSearchTrigger,
  SearchTrigger,
} from "fumadocs-ui/layouts/shared/slots/search-trigger";
import { BlocTexte } from "@/components/BlocTexte";
import { DefilementDoux } from "@/components/DefilementDoux";
import { Faq } from "@/components/Faq";
import { GithubIcon } from "@/components/GithubIcon";
import { Logo, LogoContour, LogoMark } from "@/components/Logo";
import { NavbarCondensee } from "@/components/NavbarCondensee";
import { Scene } from "@/components/Scene";
import { SceneHero } from "@/components/SceneHero";
import { SectionBadge } from "@/components/SectionBadge";
import { Briques } from "@/components/accueil/Briques";
import { Conversation } from "@/components/accueil/Conversation";
import {
  DeriveDecisions,
  DeriveMemoire,
  DerivePerimetre,
} from "@/components/accueil/Derives";
import { Phases } from "@/components/accueil/Phases";
import { Pixels } from "@/components/accueil/Pixels";
import { Verre } from "@/components/accueil/Verre";
import chiffres from "@/lib/chiffres.json";
import { ARCH_URL, PROMPT_AMORCAGE, REPO_URL, SKILLS_URL } from "@/lib/site";

/*
 * La page d'accueil, dans l'esprit des références retenues (AgentFlow, Mazima) :
 * un titre centré et léger, une démonstration encadrée en pièce maîtresse, des
 * bandes sombres et claires qui alternent, des cartes aux coins marqués.
 *
 * Les bandes (`flow-sombre`, `flow-releve`) sont fixes quel que soit le thème :
 * c'est l'alternance qui donne son rythme à la page. Le bouton de thème vit donc
 * dans la documentation, pas ici, où il ne changerait rien.
 */

const NAVIGATION = [
  { texte: "Manifeste", url: "/docs" },
  { texte: "Démarrer", url: "/docs/demarrer" },
  { texte: "Cycle", url: "/docs/cycle" },
  { texte: "Règles", url: "/docs/regles" },
  { texte: "Prompts", url: "/docs/prompts" },
];

/* Les chiffres viennent de src/lib/chiffres.json, dénombré dans le dépôt par scripts/sync.mjs. */
const CHIFFRES = [
  {
    valeur: chiffres.regles,
    libelle: "règles codées, chacune avec ce qui la fait respecter",
  },
  {
    valeur: chiffres.phases,
    libelle: "phases, chacune fermée par une porte vérifiable",
  },
  {
    valeur: chiffres.paliers,
    libelle: "paliers d'exigence, du prototype à la production",
  },
  {
    valeur: chiffres.fichiers,
    libelle: "fichiers dans le kit, installés sans rien écraser",
  },
];

/* Ce que dit le manifeste : livré à lui-même, un agent dérive de trois façons. */
const PROBLEME = [
  {
    titre: "Décisions inventées",
    texte:
      "Un agent livré à lui-même invente les décisions qu'on ne lui a pas données.",
    visuel: <DeriveDecisions />,
  },
  {
    titre: "Périmètre qui s'élargit",
    texte:
      "Il élargit le périmètre au passage, et déclare fini ce qu'il n'a pas vérifié.",
    visuel: <DerivePerimetre />,
  },
  {
    titre: "Mémoire perdue",
    texte:
      "Il oublie d'une session à l'autre ce qui avait été tranché, et le résultat casse en production.",
    visuel: <DeriveMemoire />,
  },
];

const OUTILS = [
  "Claude Code",
  "Cursor",
  "Codex",
  "tout agent avec un terminal",
];

const AGENTS = [
  { url: "/llms.txt", role: "L'index, au format llmstxt.org" },
  { url: "/llms-full.txt", role: "Le corpus entier, en un seul fichier texte" },
  {
    url: "/md/regles.md",
    role: "Chaque page en Markdown brut, ici les règles",
  },
  {
    url: "/templates/manifest.json",
    role: "Le kit : chaque fichier et sa destination",
  },
  { url: "/flow.mjs", role: "Le script d'installation, sans dépendance" },
];

/* Des réponses réelles, reformulées en question : le manifeste et le README, jamais inventés. */
const QUESTIONS = [
  {
    question: "Maedow Flow choisit-il la stack à ma place ?",
    reponse:
      "Non. Ce n'est pas un générateur d'application : il fournit des défauts éprouvés que /architect discute projet par projet.",
  },
  {
    question: "Remplace-t-il les skills de Claude Code ?",
    reponse:
      "Non. Les skills de JavaScript-Mastery-Pro sont le moteur ; Maedow Flow les ordonne et comble ce qu'ils ne couvrent pas : les règles non négociables, les garde-fous mécaniques, les défauts de plateforme.",
  },
  {
    question: "Les règles sont-elles figées ?",
    reponse:
      "Non. Une règle qui résiste à la réalité se corrige, et la correction prend une ligne au CHANGELOG.md qui dit pourquoi.",
  },
  {
    question: "Qui décide, l'agent ou moi ?",
    reponse:
      "Toi. Le product owner (l'humain) décide du produit, valide le scope et les specs, et fusionne les pull requests ; l'agent cadre ou construit, mais ne tranche pas à ta place.",
  },
  {
    question: "Le site peut-il se périmer par rapport au corpus ?",
    reponse:
      "Non. Tout ce qu'il affiche est dérivé de corpus/*.md par site/scripts/sync.mjs à chaque publication ; rien n'est recopié à la main.",
  },
];

/* Le bouton principal des références : l'action, précédée de la marque dans un carré sombre. */
function BoutonPrincipal({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 rounded-[3px] bg-fd-primary py-1.5 pr-4 pl-1.5 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90"
    >
      <span className="flex size-7 items-center justify-center rounded-xs bg-fd-background text-fd-primary">
        <LogoMark className="size-3.5" />
      </span>
      {children}
    </Link>
  );
}

function BoutonSecondaire({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-[3px] border border-[color-mix(in_srgb,var(--color-fd-primary)_55%,transparent)] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
    >
      {children}
    </Link>
  );
}

export default function Accueil() {
  return (
    <div className="flow-sombre flex min-h-screen flex-col">
      <DefilementDoux />
      <NavbarCondensee />

      {/*
        La barre de l'accueil : sans fond ni trait en haut de page, les deux
        reviennent au défilement (NavbarCondensee). Les rôles d'animation sont
        portés par des enveloppes neutres, jamais par les liens eux-mêmes : leurs
        transitions de survol intercepteraient les valeurs écrites par GSAP.
      */}
      <header
        data-navbar
        className="sticky top-0 z-40 border-b border-fd-border bg-fd-background/80 backdrop-blur transition-[background-color,border-color,backdrop-filter] duration-300"
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <span data-navbar-marque className="inline-flex">
            <Link
              href="/"
              data-remonter
              aria-label="Maedow Flow, accueil"
              className="text-fd-foreground"
            >
              <Logo />
            </Link>
          </span>
          <ul className="hidden items-center gap-5 text-sm text-fd-muted-foreground md:flex">
            {NAVIGATION.map((lien) => (
              <li key={lien.url} data-navbar-action>
                <Link
                  href={lien.url}
                  className="transition-colors hover:text-fd-foreground"
                >
                  {lien.texte}
                </Link>
              </li>
            ))}
          </ul>
          <div className="ml-auto flex items-center gap-1.5">
            <span data-navbar-action className="inline-flex">
              <FullSearchTrigger className="hidden w-48 lg:flex" />
              <SearchTrigger className="lg:hidden" />
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
                href="/docs/demarrer"
                className="rounded-[3px] bg-fd-primary px-3 py-2 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90 sm:px-4"
              >
                Commencer
              </Link>
            </span>
          </div>
        </nav>
      </header>

      <main className="w-full flex-1">
        {/* L'ouverture : titre centré, puis la séance en pièce maîtresse, entre deux colonnes de verre. */}
        <SceneHero>
          <section className="relative -mt-16 overflow-hidden pt-16">
            <div
              data-hero="fond"
              aria-hidden="true"
              className="flow-dots flow-dots-fade pointer-events-none absolute inset-0"
            />
            <div
              aria-hidden="true"
              className="flow-glow pointer-events-none absolute inset-0"
            />
            <Verre />
            <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center sm:pt-28 sm:pb-20">
              <h1
                data-hero="titre"
                className="font-heading max-w-4xl text-[clamp(2.6rem,6vw,4.75rem)] leading-[1.02] font-medium tracking-[-0.035em] text-balance"
              >
                Un agent code vite. Maedow Flow décide de l&apos;ordre des
                choses.
              </h1>
              <p
                data-hero="promesse"
                className="mt-6 max-w-xl text-base text-pretty text-fd-muted-foreground sm:text-lg"
              >
                Ce qui se décide avant de coder, ce qui se prouve avant de
                fusionner, et ce qui ne se fait jamais. Pour des applications
                web, mobiles ou desktop qui tiennent en production.
              </p>
              <div
                data-hero="actions"
                className="mt-9 flex flex-wrap items-center justify-center gap-3"
              >
                <BoutonPrincipal href="/docs/demarrer">
                  Démarrer un projet
                </BoutonPrincipal>
                <BoutonSecondaire href="/docs">
                  Lire le manifeste
                </BoutonSecondaire>
              </div>
            </div>
            {/*
             * La scène de la séance : pleine largeur, de la hauteur de l'écran.
             * Pendant la lecture, elle se fige avec son propre fond (rien ne
             * défile derrière) et sa barre de progression ; SceneHero les
             * révèle, sans script elles restent cachées.
             */}
            <div
              data-hero="scene"
              className="relative flex flex-col justify-center pb-8 motion-safe:h-svh motion-safe:pt-16 motion-safe:pb-0"
            >
              <div
                data-hero="scene-fond"
                aria-hidden="true"
                className="flow-dots pointer-events-none absolute inset-0 hidden bg-fd-background mask-[linear-gradient(to_bottom,transparent,black_120px)]"
              />
              <div
                data-hero="progression"
                aria-hidden="true"
                className="absolute inset-x-0 top-16 hidden h-0.5 bg-fd-border"
              >
                <span
                  data-hero="progression-barre"
                  className="block h-full origin-left bg-fd-primary"
                />
              </div>
              <div
                data-hero="scene-cadre"
                className="relative flex min-h-0 w-full flex-col px-4 text-left"
              >
                <Conversation />
              </div>
            </div>
          </section>
        </SceneHero>

        <Scene className="w-full">
          {/* Les agents avec lesquels le kit s'installe, sans plugin propriétaire. */}
          <section data-anime="outils" className="border-y bg-fd-card/50">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-7 text-sm sm:flex-row">
              <span
                data-outil="libelle"
                className="shrink-0 text-fd-muted-foreground sm:w-44"
              >
                Le kit s&apos;installe avec
              </span>
              <span
                data-outil="trait"
                aria-hidden="true"
                className="hidden h-6 w-px shrink-0 bg-fd-border sm:inline-flex"
              />
              <ul className="flex flex-1 flex-wrap items-center justify-center gap-x-10 gap-y-2 sm:justify-around">
                {OUTILS.map((outil) => (
                  <li
                    key={outil}
                    data-outil="nom"
                    className="font-heading text-lg font-medium tracking-tight whitespace-nowrap"
                  >
                    {outil}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Le problème, en bande claire. */}
          <section className="flow-releve py-24 sm:py-28">
            <div className="mx-auto max-w-6xl px-4">
              <SectionBadge>Le problème</SectionBadge>
              <h2
                data-anime="titre"
                className="font-heading mt-5 max-w-3xl text-4xl font-medium tracking-[-0.03em] sm:text-5xl"
              >
                Un agent livré à lui-même dérive
              </h2>
              <p
                data-anime="intro"
                className="mt-5 max-w-2xl text-fd-muted-foreground"
              >
                Un agent IA écrit du code plus vite que n&apos;importe qui. Sans
                garde-fou, le résultat tient en démonstration et casse en
                production.
              </p>
              <ul className="mt-14 grid gap-5 md:grid-cols-3">
                {PROBLEME.map((p) => (
                  <li
                    key={p.titre}
                    data-anime="carte"
                    className="flow-coins min-w-0 border bg-fd-card p-2"
                  >
                    <div className="flow-sombre flex h-44 items-center justify-center rounded-xs p-6">
                      {p.visuel}
                    </div>
                    <div className="p-4 pt-6">
                      <h3 className="font-heading text-xl font-medium tracking-tight">
                        {p.titre}
                      </h3>
                      <p className="mt-2 text-sm text-fd-muted-foreground">
                        {p.texte}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* La réponse, en bande sombre : les cinq phases, puis ce qui a été dénombré. */}
          {/* `overflow-clip` et non `hidden` : un conteneur `hidden` défile en interne, et les cartes et l'index `sticky` qu'il contient ne colleraient plus. */}
          <section className="relative overflow-clip py-24 sm:py-28">
            {/* Le halo naît en fondu : sans ce masque, il dessinerait une arête au bord de la section. */}
            <div
              aria-hidden="true"
              className="flow-glow pointer-events-none absolute inset-0 mask-[linear-gradient(to_bottom,transparent,black_160px)]"
            />
            <div className="relative mx-auto max-w-6xl px-4">
              <SectionBadge>La réponse</SectionBadge>
              <h2
                data-anime="titre"
                className="font-heading mt-5 max-w-3xl text-4xl font-medium tracking-[-0.03em] sm:text-5xl"
              >
                Cinq phases, cinq portes
              </h2>
              <p
                data-anime="intro"
                className="mt-5 max-w-2xl text-fd-muted-foreground"
              >
                Chaque phase se termine par une porte : une condition
                vérifiable, sans laquelle on ne passe pas à la suite. Voici ce
                que chacune produit, sur un projet réel.
              </p>
              <div className="mt-14">
                <Phases />
              </div>

              <dl className="mt-20 grid grid-cols-2 gap-px overflow-hidden border bg-fd-border md:grid-cols-4">
                {/* Les cellules restent en place : seuls le nombre et son libellé s'animent. */}
                {CHIFFRES.map((c) => (
                  <div key={c.libelle} className="bg-fd-background p-6">
                    <dt className="sr-only">{c.libelle}</dt>
                    <dd>
                      <span
                        data-anime="compte"
                        data-valeur={c.valeur}
                        className="font-heading block text-5xl font-medium tracking-tight"
                      >
                        {c.valeur}
                      </span>
                      <span
                        data-anime="libelle"
                        className="mt-3 block text-sm text-fd-muted-foreground"
                      >
                        {c.libelle}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* Ce que Maedow Flow réunit, en bande claire. */}
          <section className="flow-releve py-24 sm:py-28">
            <div className="mx-auto max-w-6xl px-4">
              <SectionBadge>Capacités</SectionBadge>
              <h2
                data-anime="titre"
                className="font-heading mt-5 max-w-3xl text-4xl font-medium tracking-[-0.03em] sm:text-5xl"
              >
                Ce que Maedow Flow réunit
              </h2>
              <p
                data-anime="intro"
                className="mt-5 max-w-2xl text-fd-muted-foreground"
              >
                L&apos;architecture du code relève d&apos;un standard séparé,{" "}
                <a
                  href={ARCH_URL}
                  className="font-medium text-fd-primary underline-offset-4 hover:underline"
                >
                  Maedow Arch
                </a>
                . Maedow Flow dit comment on travaille ; Maedow Arch dit comment
                le code est rangé.
              </p>
              <div className="mt-14">
                <Briques />
              </div>
            </div>
          </section>

          {/* Installer, puis ce que le site offre aux agents, en bande sombre. */}
          <section className="py-24 sm:py-28">
            <div className="mx-auto max-w-6xl px-4">
              <SectionBadge>Installer</SectionBadge>
              <h2
                data-anime="titre"
                className="font-heading mt-5 max-w-3xl text-4xl font-medium tracking-[-0.03em] sm:text-5xl"
              >
                Une commande, dans n&apos;importe quel agent
              </h2>
              <div className="mt-14 grid gap-5 md:grid-cols-2">
                <div
                  data-anime="carte"
                  className="flow-coins min-w-0 border bg-fd-card p-6 sm:p-8"
                >
                  <h3 className="font-heading text-xl font-medium tracking-tight">
                    Avec Claude Code
                  </h3>
                  <BlocTexte
                    className="mt-5"
                    titre="Une fois par machine"
                    texte={`/plugin marketplace add maedow-arch/maedow-flow#main
/plugin install maedow-flow@maedow-flow
npx skills add JavaScript-Mastery-Pro/skills`}
                  />
                  <p className="mt-4 text-sm text-fd-muted-foreground">
                    Le skill <code>/flow</code> installe le kit,{" "}
                    <code>/flow controler</code> vérifie qu&apos;un projet le
                    respecte encore.
                  </p>
                </div>
                <div
                  data-anime="carte"
                  className="flow-coins min-w-0 border bg-fd-card p-6 sm:p-8"
                >
                  <h3 className="font-heading text-xl font-medium tracking-tight">
                    Avec un autre agent
                  </h3>
                  <BlocTexte
                    className="mt-5"
                    titre="Dans le dossier du projet"
                    texte={`curl -fsSL https://maedow-flow.vercel.app/flow.mjs -o flow.mjs
node flow.mjs installer
rm flow.mjs`}
                  />
                  <p className="mt-4 text-sm text-fd-muted-foreground">
                    Le même kit, sans plugin. Rien n&apos;est écrasé : ce qui
                    existe reste en place.
                  </p>
                </div>
              </div>

              <div className="mt-24 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
                <div>
                  <SectionBadge>Pour les agents</SectionBadge>
                  <h2
                    data-anime="titre"
                    className="font-heading mt-5 text-3xl font-medium tracking-[-0.03em] sm:text-4xl"
                  >
                    Tout le site, en texte brut
                  </h2>
                  <p
                    data-anime="intro"
                    className="mt-4 text-fd-muted-foreground"
                  >
                    Dérivé du même corpus à chaque publication. Une IA le lit
                    sans passer par le HTML.
                  </p>
                </div>
                <ul className="divide-y border-y">
                  {AGENTS.map((a) => (
                    <li key={a.url} data-anime="carte">
                      <a
                        href={a.url}
                        className="group flex items-center gap-6 py-5"
                      >
                        <span className="w-40 shrink-0 font-snippet text-sm break-all text-fd-primary sm:w-60">
                          {a.url}
                        </span>
                        <span className="flex-1 text-sm text-fd-muted-foreground">
                          {a.role}
                        </span>
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center rounded-[2px] bg-fd-foreground text-fd-background transition-colors group-hover:bg-fd-primary group-hover:text-fd-primary-foreground"
                        >
                          <LogoMark className="size-3.5" />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Les questions, en bande claire, sur deux colonnes. */}
          <section className="flow-releve py-24 sm:py-28">
            <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
              {/* La colonne de gauche reste en haut : déplier une réponse ne doit rien y déplacer. */}
              <div className="flex flex-col items-start lg:self-start">
                <SectionBadge>FAQ</SectionBadge>
                <h2
                  data-anime="titre"
                  className="font-heading mt-5 text-4xl font-medium tracking-[-0.03em] sm:text-5xl"
                >
                  Ce que Maedow Flow n&apos;est pas
                </h2>
                <p data-anime="intro" className="mt-5 text-fd-muted-foreground">
                  Les questions qui reviennent, répondues sans détour.
                </p>
                <div className="mt-12">
                  <p className="font-medium">Une autre question ?</p>
                  <p className="mt-1 text-sm text-fd-muted-foreground">
                    Le corpus y répond, page par page.
                  </p>
                  <Link
                    href="/docs"
                    className="mt-4 inline-flex rounded-[3px] bg-fd-foreground px-4 py-2.5 text-sm font-semibold text-fd-background transition-opacity hover:opacity-90"
                  >
                    Lire la documentation
                  </Link>
                </div>
              </div>
              <Faq items={QUESTIONS} />
            </div>
          </section>

          {/* L'appel final, bordé de pixels verts. */}
          <section className="relative overflow-hidden border-b">
            <Pixels />
            <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-36 text-center">
              <SectionBadge>Commencer</SectionBadge>
              <h2
                data-anime="titre"
                className="font-heading mt-5 text-[clamp(1.9rem,4.4vw,3.25rem)] font-medium tracking-[-0.03em] sm:whitespace-nowrap"
              >
                Prêt à cadrer ton prochain projet&nbsp;?
              </h2>
              <p
                data-anime="intro"
                className="mt-5 max-w-xl text-fd-muted-foreground"
              >
                Le premier message à donner à ton agent, dans un dossier vide ou
                un projet existant : Claude Code, Cursor, Codex ou tout agent
                qui dispose d&apos;un terminal.
              </p>
              <div
                data-anime="carte"
                className="flow-terminal mt-10 w-full max-w-3xl text-left"
              >
                <BlocTexte
                  className="my-0"
                  titre="Prompt d'amorçage"
                  texte={PROMPT_AMORCAGE}
                />
              </div>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <BoutonPrincipal href="/docs/demarrer">
                  Démarrer un projet
                </BoutonPrincipal>
                <BoutonSecondaire href="/docs">
                  Lire le manifeste
                </BoutonSecondaire>
              </div>
            </div>
          </section>

          <footer className="relative overflow-hidden">
            <div className="mx-auto max-w-6xl px-4">
              <div className="grid gap-10 pt-16 pb-12 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
                <div data-anime="colonne">
                  <Link href="/" data-remonter aria-label="Maedow Flow, accueil" className="inline-flex text-fd-foreground">
                    <Logo />
                  </Link>
                  <p className="mt-3 max-w-xs text-sm text-fd-muted-foreground">
                    Un workflow de développement pour construire des
                    applications solides avec des agents IA.
                  </p>
                </div>
                <div data-anime="colonne">
                  <p className="text-sm font-semibold">Le corpus</p>
                  <ul className="mt-4 flex flex-col gap-2.5 text-sm text-fd-muted-foreground">
                    <li>
                      <Link href="/docs" className="hover:text-fd-foreground">
                        Manifeste
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/docs/demarrer"
                        className="hover:text-fd-foreground"
                      >
                        Démarrer
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/docs/cycle"
                        className="hover:text-fd-foreground"
                      >
                        Cycle
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/docs/regles"
                        className="hover:text-fd-foreground"
                      >
                        Règles
                      </Link>
                    </li>
                  </ul>
                </div>
                <div data-anime="colonne">
                  <p className="text-sm font-semibold">Aller plus loin</p>
                  <ul className="mt-4 flex flex-col gap-2.5 text-sm text-fd-muted-foreground">
                    <li>
                      <Link
                        href="/docs/claude-code"
                        className="hover:text-fd-foreground"
                      >
                        Claude Code
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/docs/plateformes"
                        className="hover:text-fd-foreground"
                      >
                        Plateformes
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/docs/securite"
                        className="hover:text-fd-foreground"
                      >
                        Sécurité
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/docs/echelle"
                        className="hover:text-fd-foreground"
                      >
                        Tenir la charge
                      </Link>
                    </li>
                  </ul>
                </div>
                <div data-anime="colonne">
                  <p className="text-sm font-semibold">Ailleurs</p>
                  <ul className="mt-4 flex flex-col gap-2.5 text-sm text-fd-muted-foreground">
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
                      <a
                        href="/llms-full.txt"
                        className="hover:text-fd-foreground"
                      >
                        llms-full.txt
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t py-6 text-sm text-fd-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>
                  © {new Date().getFullYear()} Maedow Flow. Licence MIT.
                </span>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:text-fd-foreground"
                >
                  <GithubIcon className="size-4" />
                  GitHub
                </a>
              </div>
            </div>
            {/* La signature : le logo en contour, marque et nom, à peine visible, qui déborde du bas de la page. */}
            <p
              aria-hidden="true"
              className="flow-signature font-heading -mb-[0.22em] text-center text-[11.2vw] leading-none font-medium tracking-[-0.04em] whitespace-nowrap select-none"
            >
              <LogoContour className="mr-[0.26em] inline-block h-[0.73em] w-auto align-baseline" />
              Maedow Flow
            </p>
          </footer>
        </Scene>
      </main>
    </div>
  );
}
