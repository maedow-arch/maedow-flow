#!/usr/bin/env node
/**
 * Contrôle du corpus et des textes du dépôt, avant chaque pull request.
 *
 * Deux défauts ne cassent aucun build et passent donc inaperçus :
 *
 * 1. Le tiret cadratin employé pour accoler une incise (MF-017). Il est cherché
 *    hors du code : un exemple entre accents graves qui le montre pour
 *    l'interdire n'est pas une faute.
 * 2. Les liens internes morts, fichier ou ancre. Un lien vers une règle dont le
 *    titre a changé se casse en silence, et le lecteur tombe en haut de page.
 *
 * Les ancres sont calculées comme le fait le site (github-slugger) : minuscules,
 * ponctuation retirée, espaces changées en tirets.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Un argument désigne une autre racine : c'est ainsi que les tests prouvent que
// le contrôle sait échouer.
const RACINE = resolve(process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), ".."));

/** Les textes que lit un humain ou un agent, et que ce contrôle surveille. */
const CIBLES = ["corpus", "templates", "skills", "global", "README.md", "AGENTS.md", "CHANGELOG.md"];
const EXTENSIONS = /\.(md|mjs|json|yml)$|(^|[\\/])(pre-push|commit-msg)$/;

function fichiers(chemin) {
  const absolu = join(RACINE, chemin);
  if (!existsSync(absolu)) return [];
  if (statSync(absolu).isFile()) return [absolu];
  return readdirSync(absolu, { withFileTypes: true }).flatMap((e) =>
    e.name === "node_modules" ? [] : fichiers(join(chemin, e.name)),
  );
}

/** Retire les blocs de code et le code en ligne : on juge la prose. */
function prose(texte) {
  return texte.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
}

export function ancre(titre) {
  return titre
    .replace(/`/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
    .replace(/ /g, "-");
}

function ancresDe(fichier) {
  const texte = readFileSync(fichier, "utf8").replace(/```[\s\S]*?```/g, "");
  return new Set([...texte.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)].map((m) => ancre(m[1])));
}

const fautes = [];

for (const fichier of CIBLES.flatMap(fichiers).filter((f) => EXTENSIONS.test(f))) {
  const texte = readFileSync(fichier, "utf8");
  const nom = relative(RACINE, fichier);

  // Les scripts de hook citent le caractère qu'ils refusent : c'est leur travail.
  const citeLeCaractere = /(^|[\\/])commit-msg$/.test(fichier) || fichier.endsWith("controle-corpus.mjs");
  if (!citeLeCaractere) {
    prose(texte)
      .split("\n")
      .forEach((ligne, i) => {
        if (/ — | – /.test(ligne)) fautes.push(`${nom}:${i + 1} : tiret d'incise (MF-017) : ${ligne.trim().slice(0, 80)}`);
      });
  }

  if (!fichier.endsWith(".md")) continue;
  for (const [, cible] of prose(texte).matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#$)/.test(cible)) continue;
    const [chemin, fragment] = cible.split("#");
    const vise = chemin ? resolve(dirname(fichier), chemin) : fichier;
    if (!existsSync(vise)) {
      fautes.push(`${nom} : lien vers un fichier absent : ${cible}`);
      continue;
    }
    if (fragment && vise.endsWith(".md") && !ancresDe(vise).has(fragment)) {
      fautes.push(`${nom} : ancre introuvable : ${cible}`);
    }
  }
}

if (fautes.length) {
  console.error(`\n${fautes.length} défaut(s) dans les textes :\n`);
  for (const f of fautes) console.error(`  ✗ ${f}`);
  console.error("");
  process.exitCode = 1;
} else {
  console.log("Textes conformes : aucun tiret d'incise, aucun lien interne mort.");
}
