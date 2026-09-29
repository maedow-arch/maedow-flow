#!/usr/bin/env node
/**
 * Dérive tout ce que le site publie depuis la racine du dépôt.
 *
 * `corpus/*.md` est la seule source de vérité. Ce script en tire, à chaque
 * `dev` et à chaque `build` :
 *
 *   content/docs/*.mdx         les pages du site, pour les humains
 *   public/llms.txt            l'index pour agents (format llmstxt.org)
 *   public/llms-full.txt       le corpus entier en un seul fichier texte
 *   public/md/*.md             chaque page, en Markdown brut
 *   public/templates/**        le kit, tel que flow.mjs le télécharge
 *   public/flow.mjs            le script d'installation, utilisable sans plugin
 *
 * Rien de tout cela n'est versionné : une copie écrite à la main se périmerait
 * au premier changement du corpus, et personne ne le verrait.
 */
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { cheminPublie, SITE } from "../../scripts/flow.mjs";

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE_SITE = join(ICI, "..");
const DEPOT = join(RACINE_SITE, "..");
const CORPUS = join(DEPOT, "corpus");
const CONTENU = join(RACINE_SITE, "content", "docs");
const PUBLIC = join(RACINE_SITE, "public");

/** L'ordre de lecture, qui est aussi celui de la navigation et de llms-full.txt. */
const PAGES = [
  {
    fichier: "manifeste.md",
    slug: "index",
    titre: "Manifeste",
    description: "Le problème que Maedow Flow résout, ses six principes et ses rôles.",
  },
  {
    fichier: "demarrer.md",
    slug: "demarrer",
    titre: "Démarrer",
    description: "Préparer une machine, lancer un projet neuf, faire entrer un projet existant dans le workflow.",
  },
  {
    fichier: "cycle.md",
    slug: "cycle",
    titre: "Cycle",
    description: "Cinq phases, une porte vérifiable à la sortie de chacune, et quatre paliers d'exigence.",
  },
  {
    fichier: "regles.md",
    slug: "regles",
    titre: "Règles",
    description: "MF-001 à MF-017, et ce qui fait respecter chacune : la machine, un skill, ou la revue.",
  },
  {
    fichier: "claude-code.md",
    slug: "claude-code",
    titre: "Claude Code",
    description: "Où vit chaque consigne, le moteur de skills, les permissions, les hooks et le contexte.",
  },
  {
    fichier: "plateformes.md",
    slug: "plateformes",
    titre: "Plateformes",
    description: "Les stacks par défaut pour le web, le mobile et le desktop, avec leur degré de preuve.",
  },
  {
    fichier: "securite.md",
    slug: "securite",
    titre: "Sécurité",
    description: "Le socle minimal, vérifiable ligne à ligne, avant chaque livraison.",
  },
  {
    fichier: "echelle.md",
    slug: "echelle",
    titre: "Tenir la charge",
    description: "Ne pas tomber quand les requêtes affluent : précautions du premier jour, pic annoncé, montée en charge sur mesure.",
  },
  {
    fichier: "prompts.md",
    slug: "prompts",
    titre: "Prompts",
    description: "Les formulations éprouvées pour chaque moment du cycle.",
  },
];

const PAR_FICHIER = new Map(PAGES.map((p) => [p.fichier, p]));
const urlDePage = (page) => (page.slug === "index" ? "/docs" : `/docs/${page.slug}`);

/** Retire le titre de niveau 1 de tête : Fumadocs affiche celui du frontmatter. */
function sansTitre(markdown) {
  return markdown.replace(/^\s*# .*\n+/, "");
}

/** Réécrit les liens entre pages du corpus, `cycle.md#ancre` devenant `<base>/docs/cycle#ancre`. */
function relier(markdown, base = "") {
  return markdown.replace(/\]\(([\w-]+\.md)(#[^)]*)?\)/g, (tout, fichier, ancre = "") => {
    const page = PAR_FICHIER.get(fichier);
    return page ? `](${base}${urlDePage(page)}${ancre})` : tout;
  });
}

/**
 * Fumadocs enveloppe chaque titre dans un lien vers sa propre ancre : un lien
 * écrit dans un titre du corpus (`## Secrets ([MF-006](regles.md#…))`) donnerait
 * un `<a>` dans un `<a>`, invalide en HTML, et React refuse de l'hydrater. Sur
 * le site, le titre garde le texte du lien ; le corpus et les fichiers pour
 * agents gardent le lien. Les blocs de code, où `#` ouvre un commentaire, ne
 * sont pas touchés.
 */
function titresSansLien(markdown) {
  return markdown
    .split(/(```[\s\S]*?```)/)
    .map((bloc, i) =>
      i % 2 === 1 ? bloc : bloc.replace(/^#{1,6} .*$/gm, (titre) => titre.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")),
    )
    .join("");
}

/**
 * Le MDX lit `{`, `}` et `<` comme du code. Hors des blocs et du code en ligne,
 * ce sont ici des caractères de texte : on les échappe.
 */
function versMdx(markdown) {
  return markdown
    .split(/(```[\s\S]*?```)/)
    .map((bloc, i) =>
      i % 2 === 1
        ? bloc
        : bloc
            .split(/(`[^`\n]*`)/)
            .map((morceau, j) => (j % 2 === 1 ? morceau : morceau.replace(/([{}<])/g, "\\$1")))
            .join(""),
    )
    .join("");
}

const yaml = (valeur) => `"${valeur.replaceAll('"', '\\"')}"`;

function fichiersDe(dossier) {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    return statSync(chemin).isDirectory() ? fichiersDe(chemin) : [chemin];
  });
}

/* Repartir d'une ardoise propre : un fichier retiré du corpus disparaît du site. */
for (const cible of [CONTENU, join(PUBLIC, "md"), join(PUBLIC, "templates")]) rmSync(cible, { recursive: true, force: true });
mkdirSync(CONTENU, { recursive: true });
mkdirSync(join(PUBLIC, "md"), { recursive: true });

const sources = new Map(PAGES.map((p) => [p.fichier, readFileSync(join(CORPUS, p.fichier), "utf8").replace(/\r\n/g, "\n")]));

const orphelins = readdirSync(CORPUS).filter((f) => f.endsWith(".md") && !PAR_FICHIER.has(f));
if (orphelins.length) {
  throw new Error(`Pages du corpus absentes de PAGES dans site/scripts/sync.mjs : ${orphelins.join(", ")}`);
}

/* Les pages du site. */
for (const page of PAGES) {
  const entete = `---\ntitle: ${yaml(page.titre)}\ndescription: ${yaml(page.description)}\n---\n\n`;
  writeFileSync(join(CONTENU, `${page.slug}.mdx`), entete + versMdx(titresSansLien(relier(sansTitre(sources.get(page.fichier))))));
}
writeFileSync(join(CONTENU, "meta.json"), `${JSON.stringify({ title: "Maedow Flow", pages: PAGES.map((p) => p.slug) }, null, 2)}\n`);

/* Chaque page en Markdown brut, liens relatifs intacts : /md/cycle.md se trouve à côté de /md/demarrer.md. */
for (const page of PAGES) writeFileSync(join(PUBLIC, "md", page.fichier), sources.get(page.fichier));

/* llms.txt : l'index, au format llmstxt.org. */
const index = [
  "# Maedow Flow",
  "",
  "> Un workflow de développement pour construire des applications solides avec des agents IA, du premier prompt jusqu'à la production : web, mobile ou desktop.",
  "",
  "Pour appliquer ce workflow à un projet, lis d'abord le corpus complet en texte brut, avec curl ou un équivalent, pas avec un outil qui résume la page : un résumé perd le texte exact des règles.",
  "",
  `    curl -fsSL ${SITE}/llms-full.txt`,
  "",
  "Suis ensuite la page Démarrer. Chaque règle porte un code stable (MF-001 à MF-017) : cite-le quand une règle est en jeu.",
  "",
  "## Corpus",
  "",
  ...PAGES.map((p) => `- [${p.titre}](${SITE}/md/${p.fichier}): ${p.description}`),
  "",
  "## Kit",
  "",
  `- [Manifeste du kit](${SITE}/templates/manifest.json): chaque fichier du kit, sa source et sa destination dans le projet`,
  `- [Script d'installation](${SITE}/flow.mjs): \`node flow.mjs installer | controler | proteger\`, sans dépendance, n'écrase rien`,
  "",
  "## Optional",
  "",
  "- [Maedow Arch](https://maedow-arch-docs.vercel.app/llms.txt): le standard d'architecture du code TypeScript auquel Maedow Flow renvoie",
  "- [Skills moteur](https://github.com/JavaScript-Mastery-Pro/skills): /scope, /architect, /develop, /check, /test, /debug, /sync, /audit, /document",
  "",
].join("\n");
writeFileSync(join(PUBLIC, "llms.txt"), index);

/* llms-full.txt : tout le corpus, dans l'ordre de lecture. */
const separateur = "=".repeat(72);
const complet = [
  "# Maedow Flow",
  "",
  "Un workflow de développement pour construire des applications solides avec des agents IA.",
  `Site : ${SITE}`,
  "",
  "Ce fichier rassemble le corpus entier. Il est dérivé du dépôt à chaque publication,",
  "jamais recopié à la main : il ne peut pas se périmer sans que le corpus se périme aussi.",
  ...PAGES.map((p) => `\n\n${separateur}\n# ${p.titre}\n${separateur}\n\n${relier(sansTitre(sources.get(p.fichier)), SITE).trim()}`),
  "",
].join("\n");
writeFileSync(join(PUBLIC, "llms-full.txt"), complet);

/* Le kit, sous des chemins sans point de tête, et le script qui sait les retrouver. */
const TEMPLATES = join(DEPOT, "templates");
for (const fichier of fichiersDe(TEMPLATES)) {
  const publie = join(PUBLIC, "templates", cheminPublie(relative(TEMPLATES, fichier).split("\\").join("/")));
  mkdirSync(dirname(publie), { recursive: true });
  copyFileSync(fichier, publie);
}
copyFileSync(join(DEPOT, "scripts", "flow.mjs"), join(PUBLIC, "flow.mjs"));

/*
 * Les chiffres de la page d'accueil, dénombrés dans le dépôt. Un chiffre écrit à
 * la main se périme au premier ajout de règle, et personne ne le voit. Un
 * chiffre introuvable arrête le build plutôt que d'afficher zéro.
 */
const sectionPaliers = (sources.get("cycle.md").split("## Les paliers")[1] ?? "").split("\n## ")[0];
const chiffres = {
  regles: (sources.get("regles.md").match(/^## MF-\d{3} /gm) ?? []).length,
  phases: (sources.get("cycle.md").match(/^## Phase \d/gm) ?? []).length,
  paliers: (sectionPaliers.match(/^\| `/gm) ?? []).length,
  fichiers: JSON.parse(readFileSync(join(TEMPLATES, "manifest.json"), "utf8")).fichiers.length,
};
for (const [nom, valeur] of Object.entries(chiffres)) {
  if (!valeur) throw new Error(`Chiffre introuvable dans le dépôt : ${nom}. Vérifier le motif dans site/scripts/sync.mjs.`);
}
writeFileSync(join(RACINE_SITE, "src", "lib", "chiffres.json"), `${JSON.stringify(chiffres, null, 2)}\n`);

console.log(`Maedow Flow : ${PAGES.length} pages, llms.txt, llms-full.txt, le kit et flow.mjs dérivés du dépôt.`);
