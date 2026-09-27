#!/usr/bin/env node
/**
 * Maedow Flow : installe, contrôle et protège le kit dans un projet.
 *
 *   node flow.mjs installer  [--cible <dossier>] [--depuis <url>]
 *   node flow.mjs controler  [--cible <dossier>] [--depuis <url>]
 *   node flow.mjs proteger   [--cible <dossier>] [--depuis <url>]
 *
 * Les modèles sont lus dans `templates/` à côté du script (dépôt ou plugin
 * Claude Code). Quand le script tourne seul, téléchargé depuis le site, il les
 * récupère sur le site : le même fichier sert donc à Claude Code, aux autres
 * agents et aux humains.
 *
 * Ce script n'écrase jamais un fichier existant. Il installe ce qui manque et
 * dit ce qu'il a laissé en place : un projet existant a peut-être de bonnes
 * raisons d'avoir son propre fichier, et c'est à l'humain d'en juger.
 */
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SITE = "https://maedow-flow.vercel.app";

const ICI = dirname(fileURLToPath(import.meta.url));
const MODELES_LOCAUX = join(ICI, "..", "templates");

/** Lignes que le .gitignore d'un projet doit contenir (MF-006). */
const IGNORES = [".env", ".env.local", ".env.*.local", ".env.production", ".claude/settings.local.json"];

/** Les contrôles que `verify` enchaîne, dans cet ordre, s'ils existent (MF-005). */
const CONTROLES = ["lint", "typecheck", "test", "build"];

const PREPARE = `node -e "try{require('child_process').execSync('git config core.hooksPath .githooks',{stdio:'ignore'})}catch{}"`;

/* ------------------------------------------------------------------------ */
/* Modèles                                                                   */
/* ------------------------------------------------------------------------ */

/**
 * Chemin publié sur le site : un segment qui commence par un point prend un
 * tiret bas (`.claude/settings.json` devient `_claude/settings.json`), parce
 * qu'un hébergeur statique ne sert pas toujours les fichiers cachés.
 */
export function cheminPublie(source) {
  return source
    .split("/")
    .map((segment) => (segment.startsWith(".") ? `_${segment.slice(1)}` : segment))
    .join("/");
}

function sourceDesModeles(depuis) {
  if (depuis) return { distante: depuis.replace(/\/$/, "") };
  if (existsSync(join(MODELES_LOCAUX, "manifest.json"))) return { locale: MODELES_LOCAUX };
  return { distante: `${SITE}/templates` };
}

async function lireModele(source, chemin) {
  if (source.locale) return readFileSync(join(source.locale, chemin), "utf8");
  const url = `${source.distante}/${cheminPublie(chemin)}`;
  const reponse = await fetch(url);
  if (!reponse.ok) throw new Error(`Modèle introuvable : ${url} (${reponse.status})`);
  return reponse.text();
}

async function lireManifeste(source) {
  return JSON.parse(await lireModele(source, "manifest.json"));
}

/* ------------------------------------------------------------------------ */
/* Projet                                                                    */
/* ------------------------------------------------------------------------ */

function git(cible, ...args) {
  try {
    return execFileSync("git", args, { cwd: cible, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

const estDepotGit = (cible) => git(cible, "rev-parse", "--is-inside-work-tree") === "true";

export function gestionnaire(cible) {
  if (existsSync(join(cible, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cible, "bun.lock")) || existsSync(join(cible, "bun.lockb"))) return "bun";
  if (existsSync(join(cible, "yarn.lock"))) return "yarn";
  return "npm";
}

const lancer = (pm, script) => (pm === "yarn" ? `yarn ${script}` : `${pm} run ${script}`);

/** Le script par défaut d'npm init n'est pas un test : il échoue toujours. */
const estFauxTest = (commande) => /no test specified/.test(commande ?? "");

function lirePackage(cible) {
  const chemin = join(cible, "package.json");
  if (!existsSync(chemin)) return null;
  const brut = readFileSync(chemin, "utf8");
  const indentation = brut.match(/^[ \t]+(?=")/m)?.[0] ?? "  ";
  return { chemin, donnees: JSON.parse(brut), indentation };
}

/** Compose `verify` depuis les contrôles que le projet déclare vraiment. */
export function composerVerify(scripts, pm) {
  const presents = CONTROLES.filter((nom) => scripts[nom] && !(nom === "test" && estFauxTest(scripts[nom])));
  return presents.length ? presents.map((nom) => lancer(pm, nom)).join(" && ") : null;
}

/* ------------------------------------------------------------------------ */
/* installer                                                                 */
/* ------------------------------------------------------------------------ */

export async function installer({ cible, depuis }) {
  const source = sourceDesModeles(depuis);
  const manifeste = await lireManifeste(source);
  const pm = gestionnaire(cible);
  const rapport = { poses: [], laisses: [], notes: [] };

  for (const fichier of manifeste.fichiers) {
    const destination = join(cible, fichier.destination);
    if (existsSync(destination)) {
      rapport.laisses.push(fichier.destination);
      continue;
    }
    let contenu = await lireModele(source, fichier.source);
    if (fichier.destination === "AGENTS.md" && pm !== "npm") {
      contenu = contenu.replaceAll("npm run verify", lancer(pm, "verify"));
    }
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, contenu.replace(/\r\n/g, "\n"));
    if (fichier.executable) {
      try {
        chmodSync(destination, 0o755);
      } catch {
        // Windows ignore les droits POSIX ; git les porte via l'index (plus bas).
      }
    }
    rapport.poses.push(fichier.destination);
  }

  completerGitignore(cible, rapport);
  completerPackage(cible, pm, rapport);

  if (estDepotGit(cible)) {
    git(cible, "config", "core.hooksPath", ".githooks");
    rapport.notes.push("git : core.hooksPath pointe vers .githooks.");
    // Le bit exécutable doit vivre dans l'index, sans quoi les hooks ne
    // s'exécutent pas sur un clone Linux ou macOS.
    const hooks = manifeste.fichiers.filter((f) => f.executable).map((f) => f.destination);
    if (git(cible, "add", "--chmod=+x", "--", ...hooks) !== null) {
      rapport.notes.push(`git : ${hooks.join(", ")} indexés comme exécutables.`);
    }
  } else {
    rapport.notes.push("Pas encore de dépôt git : après `git init`, lance `git config core.hooksPath .githooks`.");
  }

  return rapport;
}

function completerGitignore(cible, rapport) {
  const chemin = join(cible, ".gitignore");
  const actuel = existsSync(chemin) ? readFileSync(chemin, "utf8") : "";
  const lignes = new Set(actuel.split(/\r?\n/).map((l) => l.trim()));
  const joker = lignes.has(".env*") || lignes.has(".env.*");
  const manquantes = IGNORES.filter((l) => !lignes.has(l) && !(joker && l.startsWith(".env")));
  if (!manquantes.length) return;
  const bloc = `${actuel && !actuel.endsWith("\n") ? "\n" : ""}${actuel ? "\n" : ""}# Maedow Flow (MF-006)\n${manquantes.join("\n")}\n`;
  writeFileSync(chemin, actuel + bloc);
  rapport.notes.push(`.gitignore : ajout de ${manquantes.join(", ")}.`);
}

function completerPackage(cible, pm, rapport) {
  const paquet = lirePackage(cible);
  if (!paquet) {
    rapport.notes.push("Pas de package.json : le script verify sera à créer quand le projet existera (MF-005).");
    return;
  }
  const scripts = (paquet.donnees.scripts ??= {});
  let modifie = false;

  if (!scripts.typecheck && existsSync(join(cible, "tsconfig.json"))) {
    scripts.typecheck = "tsc --noEmit";
    rapport.notes.push('package.json : ajout de "typecheck": "tsc --noEmit".');
    modifie = true;
  }
  if (estFauxTest(scripts.test)) {
    rapport.notes.push("package.json : le script test est celui d'npm init, il est exclu de verify.");
  }
  if (!scripts.verify) {
    const verify = composerVerify(scripts, pm);
    if (verify) {
      scripts.verify = verify;
      rapport.notes.push(`package.json : ajout de "verify": "${verify}".`);
      modifie = true;
    } else {
      rapport.notes.push("package.json : aucun contrôle (lint, typecheck, test, build) à enchaîner, verify reste à créer.");
    }
  }
  if (!scripts.prepare) {
    scripts.prepare = PREPARE;
    rapport.notes.push('package.json : ajout de "prepare", qui active les hooks git à chaque installation.');
    modifie = true;
  } else if (!scripts.prepare.includes("core.hooksPath")) {
    rapport.notes.push(`package.json : "prepare" existe déjà, ajoute-lui l'activation des hooks : git config core.hooksPath .githooks`);
  }

  if (modifie) writeFileSync(paquet.chemin, `${JSON.stringify(paquet.donnees, null, paquet.indentation)}\n`);
}

/* ------------------------------------------------------------------------ */
/* controler                                                                 */
/* ------------------------------------------------------------------------ */

export async function controler({ cible, depuis }) {
  const source = sourceDesModeles(depuis);
  const manifeste = await lireManifeste(source);
  const constats = [];
  const constater = (ok, libelle, conseil) => constats.push({ ok, libelle, conseil });

  for (const fichier of manifeste.fichiers) {
    constater(existsSync(join(cible, fichier.destination)), fichier.destination, "/flow installer le pose");
  }

  const paquet = lirePackage(cible);
  if (paquet) {
    constater(Boolean(paquet.donnees.scripts?.verify), "script verify dans package.json (MF-005)", "/flow installer le compose");
  }

  const gitignore = existsSync(join(cible, ".gitignore")) ? readFileSync(join(cible, ".gitignore"), "utf8") : "";
  constater(/^\.env(\*|\.\*)?\s*$/m.test(gitignore), ".gitignore couvre les fichiers .env (MF-006)", "/flow installer l'ajoute");

  const agents = existsSync(join(cible, "AGENTS.md")) ? readFileSync(join(cible, "AGENTS.md"), "utf8") : "";
  if (agents) {
    // Le commentaire d'en-tête du modèle cite les marqueurs pour les expliquer :
    // le compter signalerait à vie un AGENTS.md pourtant entièrement rempli.
    const texte = agents.replace(/<!--[\s\S]*?-->/g, "");
    const trous = (texte.match(/<(à compléter|to be filled|TBD|Nom du projet)[^>]*>/g) ?? []).length;
    constater(trous === 0, "AGENTS.md sans champ à compléter", `${trous} champ(s) à remplir : /audit, /scope, ou à la main`);
    constater(/integration:\s*on/.test(agents), "AGENTS.md active l'intégration git des skills", "## Git : - integration: on");
  }

  if (estDepotGit(cible)) {
    constater(git(cible, "config", "core.hooksPath") === ".githooks", "hooks git actifs (core.hooksPath)", "git config core.hooksPath .githooks");
    const develop =
      git(cible, "rev-parse", "--verify", "--quiet", "refs/heads/develop") !== null ||
      git(cible, "rev-parse", "--verify", "--quiet", "refs/remotes/origin/develop") !== null;
    constater(develop, "branche develop (MF-003)", "git switch -c develop, puis la pousser (Démarrer, le dépôt distant)");
  } else {
    constater(false, "dépôt git", "git init");
  }

  return constats;
}

/* ------------------------------------------------------------------------ */
/* proteger                                                                  */
/* ------------------------------------------------------------------------ */

function gh(cible, args, entree) {
  return execFileSync("gh", args, {
    cwd: cible,
    encoding: "utf8",
    input: entree,
    stdio: [entree ? "pipe" : "ignore", "pipe", "pipe"],
  });
}

export async function proteger({ cible, depuis }) {
  const source = sourceDesModeles(depuis);
  const manifeste = await lireManifeste(source);
  const regles = await lireModele(source, manifeste.ruleset);
  const nom = JSON.parse(regles).name;

  let existants;
  try {
    existants = JSON.parse(gh(cible, ["api", "repos/{owner}/{repo}/rulesets"]));
  } catch (erreur) {
    return expliquerEchec(erreur);
  }
  const existant = existants.find((r) => r.name === nom);
  const [methode, chemin] = existant
    ? ["PUT", `repos/{owner}/{repo}/rulesets/${existant.id}`]
    : ["POST", "repos/{owner}/{repo}/rulesets"];

  try {
    gh(cible, ["api", "--method", methode, chemin, "--input", "-"], regles);
  } catch (erreur) {
    return expliquerEchec(erreur);
  }
  return {
    ok: true,
    message: `Ruleset « ${nom} » ${existant ? "mis à jour" : "créé"} : main et develop exigent une pull request et les statuts verify et secrets, sans contournement possible.`,
  };
}

function expliquerEchec(erreur) {
  const detail = `${erreur.stderr ?? ""}${erreur.message ?? ""}`;
  if (/403|upgrade|not available/i.test(detail)) {
    return {
      ok: false,
      message:
        "GitHub refuse les rulesets sur ce dépôt (403). C'est le cas d'un dépôt privé sur un compte gratuit. " +
        "La règle MF-003 est alors tenue par les hooks locaux et la CI seuls : vérifie que chaque poste a lancé " +
        "`git config core.hooksPath .githooks`.",
    };
  }
  if (/ENOENT/.test(detail)) return { ok: false, message: "La CLI GitHub (gh) est introuvable. Installe-la puis lance `gh auth login`." };
  return { ok: false, message: `Échec de l'appel à GitHub : ${detail.trim().split("\n")[0]}` };
}

/* ------------------------------------------------------------------------ */
/* Ligne de commande                                                         */
/* ------------------------------------------------------------------------ */

function lireArguments(argv) {
  const [commande, ...reste] = argv;
  const options = { cible: process.cwd(), depuis: null };
  for (let i = 0; i < reste.length; i += 1) {
    if (reste[i] === "--cible") options.cible = resolve(reste[++i]);
    else if (reste[i] === "--depuis") options.depuis = reste[++i];
  }
  return { commande, options };
}

async function principal() {
  const { commande, options } = lireArguments(process.argv.slice(2));

  if (commande === "installer") {
    const rapport = await installer(options);
    console.log("\nMaedow Flow · installation\n");
    for (const f of rapport.poses) console.log(`  + ${f}`);
    for (const f of rapport.laisses) console.log(`  = ${f} (déjà présent, laissé en place)`);
    if (rapport.notes.length) console.log("");
    for (const n of rapport.notes) console.log(`  · ${n}`);
    console.log("\nEnsuite : complète « Le produit » dans AGENTS.md, puis /audit.\n");
    return;
  }

  if (commande === "controler") {
    const constats = await controler(options);
    console.log("\nMaedow Flow · contrôle\n");
    for (const c of constats) console.log(`  ${c.ok ? "✓" : "✗"} ${c.libelle}${c.ok ? "" : `  →  ${c.conseil}`}`);
    const ecarts = constats.filter((c) => !c.ok).length;
    console.log(`\n${ecarts ? `${ecarts} écart(s).` : "Conforme."}\n`);
    process.exitCode = ecarts ? 1 : 0;
    return;
  }

  if (commande === "proteger") {
    const resultat = await proteger(options);
    console.log(`\n${resultat.ok ? "✓" : "✗"} ${resultat.message}\n`);
    process.exitCode = resultat.ok ? 0 : 1;
    return;
  }

  console.log("Usage : node flow.mjs <installer | controler | proteger> [--cible <dossier>] [--depuis <url>]");
  process.exitCode = 2;
}

const lanceDirectement =
  process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (lanceDirectement) {
  principal().catch((erreur) => {
    console.error(`Maedow Flow : ${erreur.message}`);
    process.exitCode = 1;
  });
}
