import { HomeLayout } from "fumadocs-ui/layouts/home";
import Link from "next/link";
import { BlocTexte } from "@/components/BlocTexte";
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
    <HomeLayout nav={{ title: "Maedow Flow" }} links={[{ text: "Documentation", url: "/docs" }]} githubUrl={REPO_URL}>
      <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:py-24">
        <p className="text-sm font-medium text-fd-muted-foreground">Workflow de développement avec agents IA</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Un agent code vite. Maedow Flow décide de l&apos;ordre des choses.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-fd-muted-foreground text-pretty">
          Ce qui se décide avant de coder, ce qui se prouve avant de fusionner, et ce qui ne se fait jamais. Pour des
          applications web, mobiles ou desktop qui tiennent en production, pas seulement en démonstration.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/docs/demarrer"
            className="rounded-lg bg-fd-primary px-4 py-2.5 text-sm font-medium text-fd-primary-foreground"
          >
            Démarrer un projet
          </Link>
          <Link href="/docs" className="rounded-lg border px-4 py-2.5 text-sm font-medium">
            Lire le manifeste
          </Link>
        </div>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">Le premier message à ton agent</h2>
          <p className="mt-3 text-fd-muted-foreground">
            Dans un dossier vide ou un projet existant, avec Claude Code, Cursor, Codex ou tout agent qui dispose
            d&apos;un terminal.
          </p>
          <BlocTexte titre="Prompt d'amorçage" texte={PROMPT_AMORCAGE} className="mt-6" />
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">Cinq phases, cinq portes</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-5">
            {PHASES.map((phase, i) => (
              <li key={phase.nom} className="rounded-xl border bg-fd-card p-4">
                <p className="text-xs text-fd-muted-foreground">Phase {i}</p>
                <p className="mt-1 font-medium">{phase.nom}</p>
                <p className="mt-2 text-sm text-fd-muted-foreground">{phase.porte}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-fd-muted-foreground">
            Dix-sept règles codées <code>MF-001</code> à <code>MF-017</code>, chacune avec ce qui la fait respecter :
            un hook, la CI, un skill, ou la seule revue.{" "}
            <Link href="/docs/regles" className="underline underline-offset-4">
              Lire les règles
            </Link>
          </p>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border bg-fd-card p-6">
            <h2 className="font-semibold">Avec Claude Code</h2>
            <BlocTexte className="mt-4" texte={`/plugin marketplace add maedow-arch/maedow-flow#main
/plugin install maedow-flow@maedow-flow
npx skills add JavaScript-Mastery-Pro/skills`} />
            <p className="mt-4 text-sm text-fd-muted-foreground">
              Le skill <code>/flow</code> installe le kit, <code>/flow controler</code> vérifie qu&apos;un projet le
              respecte encore.
            </p>
          </div>
          <div className="rounded-xl border bg-fd-card p-6">
            <h2 className="font-semibold">Avec un autre agent</h2>
            <BlocTexte className="mt-4" texte={`curl -fsSL https://maedow-flow.vercel.app/flow.mjs -o flow.mjs
node flow.mjs installer
rm flow.mjs`} />
            <p className="mt-4 text-sm text-fd-muted-foreground">
              Le même kit, sans plugin. Rien n&apos;est écrasé : ce qui existe reste en place.
            </p>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">Pour les agents</h2>
          <p className="mt-3 text-fd-muted-foreground">
            Tout ce site existe aussi en texte brut, dérivé du même corpus à chaque publication.
          </p>
          <ul className="mt-6 divide-y rounded-xl border">
            {AGENTS.map((a) => (
              <li key={a.url} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:gap-4">
                <a href={a.url} className="font-mono text-sm underline underline-offset-4">
                  {a.url}
                </a>
                <span className="text-sm text-fd-muted-foreground">{a.role}</span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-24 border-t pt-6 text-sm text-fd-muted-foreground">
          Le moteur : les skills de{" "}
          <a href={SKILLS_URL} className="underline underline-offset-4">
            JavaScript-Mastery-Pro
          </a>
          . L&apos;architecture du code :{" "}
          <a href={ARCH_URL} className="underline underline-offset-4">
            Maedow Arch
          </a>
          . Licence MIT.
        </footer>
      </main>
    </HomeLayout>
  );
}
