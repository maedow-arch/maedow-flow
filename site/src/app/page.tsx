import { HomeLayout } from "fumadocs-ui/layouts/home";
import Link from "next/link";
import { BlocTexte } from "@/components/BlocTexte";
import { Logo, LogoMark } from "@/components/Logo";
import { ARCH_URL, PROMPT_AMORCAGE, REPO_URL, SKILLS_URL } from "@/lib/site";

const PHASES = [
  { nom: "Cadrer", porte: "Chaque feature tient en une intention et une ligne « Fini quand »." },
  { nom: "Fonder", porte: "Un projet vide passe verify, en local et en CI." },
  { nom: "Construire", porte: "Chaque critère d'acceptation est constaté sur l'application qui tourne." },
  { nom: "Livrer", porte: "Les parcours critiques sont vérifiés, aucun constat critique n'est ouvert." },
  { nom: "Exploiter", porte: "On mesure avant d'ajouter la moindre brique." },
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
    <HomeLayout nav={{ title: <Logo /> }} links={[{ text: "Documentation", url: "/docs" }]} githubUrl={REPO_URL}>
      <main className="w-full">
        {/* L'ouverture : la trame de points, qui s'estompe sous l'accroche. */}
        <section className="relative overflow-hidden border-b">
          <div aria-hidden="true" className="flow-dots flow-dots-fade absolute inset-0" />
          <div className="relative mx-auto max-w-5xl px-4 pt-20 pb-16 sm:pt-28">
            <p className="inline-flex items-center gap-2 rounded-full border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground">
              <LogoMark className="size-3.5 text-fd-primary" />
              Workflow de développement avec agents IA
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold text-balance sm:text-6xl">
              Un agent code vite. <span className="text-fd-primary">Maedow Flow décide de l&apos;ordre des choses.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-pretty text-fd-muted-foreground">
              Ce qui se décide avant de coder, ce qui se prouve avant de fusionner, et ce qui ne se fait jamais. Pour
              des applications web, mobiles ou desktop qui tiennent en production, pas seulement en démonstration.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
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

            <div className="flow-terminal mt-14 max-w-3xl">
              <BlocTexte titre="Prompt d'amorçage" texte={PROMPT_AMORCAGE} />
              <p className="mt-3 text-sm text-fd-muted-foreground">
                Le premier message à ton agent, dans un dossier vide ou un projet existant : Claude Code, Cursor, Codex
                ou tout agent qui dispose d&apos;un terminal.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4">
          <section className="mt-20">
            <p className="text-sm font-semibold text-fd-primary">Le cycle</p>
            <h2 className="mt-2 text-3xl font-bold">Cinq phases, cinq portes</h2>
            <ol className="mt-8 grid gap-3 sm:grid-cols-5">
              {PHASES.map((phase, i) => (
                <li key={phase.nom} className="rounded-xl border bg-fd-card p-4 transition-colors hover:border-fd-primary">
                  <span className="inline-flex size-6 items-center justify-center rounded-md bg-fd-primary font-mono text-xs font-semibold text-fd-primary-foreground">
                    {i}
                  </span>
                  <p className="font-heading mt-3 font-semibold">{phase.nom}</p>
                  <p className="mt-2 text-sm text-fd-muted-foreground">{phase.porte}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-fd-muted-foreground">
              Dix-sept règles codées <code>MF-001</code> à <code>MF-017</code>, chacune avec ce qui la fait respecter :
              un hook, la CI, un skill, ou la seule revue.{" "}
              <Link href="/docs/regles" className="font-medium text-fd-primary underline-offset-4 hover:underline">
                Lire les règles
              </Link>
            </p>
          </section>

          <section className="mt-20 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border bg-fd-card p-6">
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
            <div className="rounded-xl border bg-fd-card p-6">
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
            <h2 className="mt-2 text-3xl font-bold">Tout le site, en texte brut</h2>
            <p className="mt-3 text-fd-muted-foreground">Dérivé du même corpus à chaque publication.</p>
            <ul className="mt-6 divide-y overflow-hidden rounded-xl border bg-fd-card">
              {AGENTS.map((a) => (
                <li key={a.url} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:gap-4">
                  <a href={a.url} className="font-mono text-sm font-medium text-fd-primary underline-offset-4 hover:underline">
                    {a.url}
                  </a>
                  <span className="text-sm text-fd-muted-foreground">{a.role}</span>
                </li>
              ))}
            </ul>
          </section>

          <footer className="mt-24 mb-10 flex flex-col gap-3 border-t pt-6 text-sm text-fd-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <Logo className="text-fd-foreground" />
            <p>
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
        </div>
      </main>
    </HomeLayout>
  );
}
