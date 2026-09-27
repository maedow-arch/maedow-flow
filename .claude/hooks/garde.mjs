#!/usr/bin/env node
/**
 * Garde Maedow Flow.
 *
 * Claude Code le lance avant chaque commande shell (Bash, PowerShell) et avant
 * chaque requête SQL passée par un serveur MCP. Il répond « refuser »,
 * « demander », ou se tait, et laisse alors les permissions décider.
 *
 * Il ne remplace ni les permissions ni les hooks git : il les double là où une
 * consigne oubliée coûterait cher. Les règles citées sont celles de Maedow Flow :
 * MF-003 (jamais sur main ni develop), MF-006 (secrets), MF-009 (migrations),
 * MF-016 (l'irréversible se confirme).
 *
 * Il échoue ouvert : une entrée illisible le rend muet plutôt que bloquant. Un
 * garde qui bloquerait tout au moindre imprévu serait désactivé dans l'heure, et
 * ne protégerait plus rien.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROTEGEES = new Set(["main", "develop"]);

/** Dossiers régénérables : les supprimer ne demande aucune confirmation. */
const JETABLES = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "out",
  "coverage",
  ".turbo",
  ".expo",
  ".vercel",
  "test-results",
  "playwright-report",
]);

const SQL_DESTRUCTEUR =
  /\b(drop\s+(table|database|schema|column|view|materialized\s+view|function|policy|index|type|extension|trigger)|truncate)\b/i;
const DELETE_SANS_WHERE = /\bdelete\s+from\s+[\w."]+\s*(;|$|\))/i;

const REFUS = "deny";
const DEMANDE = "ask";

/** Retire le contenu des chaînes : on juge la commande, pas le texte d'un message de commit. */
function sansChaines(commande) {
  return commande.replace(/'[^']*'/g, "''").replace(/"(?:[^"\\]|\\.)*"/g, '""');
}

/** Découpe sur les opérateurs shell, pour juger chaque sous-commande. */
function segments(commande) {
  return sansChaines(commande)
    .split(/&&|\|\||;|\||\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Retire les affectations de variables et `sudo` en tête de commande. */
function mots(segment) {
  const liste = segment.split(/\s+/).filter(Boolean);
  while (liste.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(liste[0]) || liste[0] === "sudo")) liste.shift();
  return liste;
}

const nomDeBranche = (ref) => ref.replace(/^refs\/heads\//, "");

function pire(a, b) {
  if (!a) return b;
  if (!b) return a;
  if (a.decision === REFUS) return a;
  if (b.decision === REFUS) return b;
  return a;
}

/* ------------------------------------------------------------------------ */
/* Git                                                                       */
/* ------------------------------------------------------------------------ */

function jugerGit(liste, contexte) {
  // Options globales de git, avant la sous-commande : `git -C dossier push`.
  let i = 1;
  while (i < liste.length && liste[i].startsWith("-")) {
    if (liste[i] === "-c" && /^core\.hookspath/i.test(liste[i + 1] ?? "")) {
      return { decision: REFUS, raison: "MF-016 : modifier core.hooksPath à la volée désactive les hooks du projet." };
    }
    if (liste[i] === "-C" || liste[i] === "-c") i += 2;
    else i += 1;
  }
  const sous = liste[i];
  const args = liste.slice(i + 1);
  const drapeaux = args.filter((a) => a.startsWith("-"));
  const court = (lettre) => drapeaux.some((d) => /^-[a-zA-Z]+$/.test(d) && d.includes(lettre));

  if (drapeaux.includes("--no-verify")) {
    return { decision: REFUS, raison: "MF-016 : --no-verify contourne les hooks du projet. Corrige la cause au lieu de sauter le contrôle." };
  }

  switch (sous) {
    case "commit": {
      if (court("n")) {
        return { decision: REFUS, raison: "MF-016 : `git commit -n` contourne les hooks du projet." };
      }
      if (PROTEGEES.has(contexte.branche())) {
        if (contexte.aucunCommit()) {
          return { decision: DEMANDE, raison: `Premier commit du dépôt sur ${contexte.branche()}. C'est la naissance du dépôt : confirme.` };
        }
        return {
          decision: REFUS,
          raison: `MF-003 : pas de commit sur ${contexte.branche()}. Crée une branche (git switch -c feat/<sujet>) puis commite dessus.`,
        };
      }
      return null;
    }

    case "push":
      return jugerPush(args, contexte);

    case "reset":
      return drapeaux.includes("--hard")
        ? { decision: DEMANDE, raison: "MF-016 : git reset --hard efface les modifications non commitées." }
        : null;

    case "clean":
      return court("f") || drapeaux.includes("--force")
        ? { decision: DEMANDE, raison: "MF-016 : git clean supprime des fichiers non suivis, sans retour possible." }
        : null;

    case "checkout":
      return args.includes("--") || args.includes(".")
        ? { decision: DEMANDE, raison: "MF-016 : cette commande abandonne des modifications locales." }
        : null;

    case "restore":
      return (drapeaux.includes("--staged") || drapeaux.includes("-S")) && !drapeaux.includes("--worktree")
        ? null
        : { decision: DEMANDE, raison: "MF-016 : git restore abandonne des modifications locales." };

    case "stash":
      return args[0] === "drop" || args[0] === "clear"
        ? { decision: DEMANDE, raison: "MF-016 : ce stash sera perdu." }
        : null;

    case "branch":
      return drapeaux.includes("-D") || (drapeaux.includes("--delete") && drapeaux.includes("--force"))
        ? { decision: DEMANDE, raison: "MF-016 : suppression forcée d'une branche, commits non fusionnés compris." }
        : null;

    case "config": {
      const cle = args.findIndex((a) => /^core\.hookspath$/i.test(a));
      if (cle === -1) return null;
      if (drapeaux.includes("--unset") || drapeaux.includes("--unset-all")) {
        return { decision: REFUS, raison: "MF-016 : retirer core.hooksPath désactive les hooks du projet." };
      }
      const valeur = args[cle + 1];
      if (valeur !== undefined && valeur !== ".githooks") {
        return { decision: REFUS, raison: "MF-016 : core.hooksPath doit rester .githooks." };
      }
      return null;
    }

    default:
      return null;
  }
}

function jugerPush(args, contexte) {
  const drapeaux = [];
  const positions = [];
  const AVEC_VALEUR = new Set(["-o", "--push-option", "--receive-pack", "--exec", "--repo"]);
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (AVEC_VALEUR.has(a)) {
      i += 1;
      continue;
    }
    if (a.startsWith("-")) drapeaux.push(a);
    else positions.push(a);
  }

  const courtAvec = (lettre) => drapeaux.some((d) => /^-[a-zA-Z]+$/.test(d) && d.includes(lettre));
  if (drapeaux.includes("--force") || courtAvec("f")) {
    return {
      decision: REFUS,
      raison: "MF-016 : git push --force réécrit l'historique partagé. Si c'est vraiment nécessaire, --force-with-lease, avec confirmation.",
    };
  }
  if (drapeaux.includes("--mirror") || drapeaux.includes("--all")) {
    return { decision: REFUS, raison: "MF-003 : --all et --mirror poussent aussi main et develop. Pousse ta branche seule." };
  }

  const distant = positions[0] ?? "origin";
  const refspecs = positions.slice(1);
  const suppression = drapeaux.includes("--delete") || courtAvec("d") || refspecs.some((r) => r.startsWith(":"));

  if (refspecs.some((r) => r.startsWith("+"))) {
    return { decision: REFUS, raison: "MF-016 : un refspec préfixé par + force la mise à jour. Même règle que --force." };
  }

  const destinations = refspecs.length
    ? refspecs.map((r) => {
        const [source, cible] = r.replace(/^:/, "").split(":");
        const nom = nomDeBranche(cible ?? source);
        return nom === "HEAD" ? contexte.branche() : nom;
      })
    : [contexte.amont() ?? contexte.branche()];

  for (const destination of destinations) {
    if (!PROTEGEES.has(destination)) continue;
    if (suppression) {
      return { decision: REFUS, raison: `MF-003 : ${destination} ne se supprime pas.` };
    }
    if (!contexte.refDistanteExiste(distant, destination)) {
      return {
        decision: DEMANDE,
        raison: `Création de ${destination} sur ${distant}. Permis une fois, à la naissance du dépôt : confirme.`,
      };
    }
    return {
      decision: REFUS,
      raison: `MF-003 : pas de push direct vers ${destination}. Pousse une branche dédiée et ouvre une pull request.`,
    };
  }

  if (suppression) {
    return { decision: DEMANDE, raison: "MF-016 : suppression d'une branche distante." };
  }
  if (drapeaux.some((d) => d.startsWith("--force-with-lease") || d.startsWith("--force-if-includes"))) {
    return { decision: DEMANDE, raison: "MF-016 : réécriture d'une branche distante. Vérifie que personne d'autre n'y travaille." };
  }
  return null;
}

/* ------------------------------------------------------------------------ */
/* Suppressions de fichiers                                                  */
/* ------------------------------------------------------------------------ */

function toutJetable(cibles) {
  return (
    cibles.length > 0 &&
    cibles.every((c) => {
      const nom = c.replace(/^["']|["']$/g, "").replace(/^\.[\\/]/, "").replace(/[\\/]+$/, "");
      return JETABLES.has(nom);
    })
  );
}

function jugerSuppression(liste) {
  const commande = liste[0]?.toLowerCase();
  const reste = liste.slice(1);

  if (commande === "rm") {
    const recursif = reste.some((a) => a === "--recursive" || /^-[a-zA-Z]*[rR][a-zA-Z]*$/.test(a));
    if (!recursif) return null;
    const cibles = reste.filter((a) => !a.startsWith("-"));
    return toutJetable(cibles) ? null : { decision: DEMANDE, raison: "MF-016 : suppression récursive de fichiers." };
  }

  if (["remove-item", "ri", "del", "erase", "rd", "rmdir"].includes(commande)) {
    const recursif = reste.some((a) => /^-recurse$/i.test(a) || /^\/s$/i.test(a));
    if (!recursif) return null;
    const cibles = reste.filter((a) => !a.startsWith("-") && !a.startsWith("/"));
    return toutJetable(cibles) ? null : { decision: DEMANDE, raison: "MF-016 : suppression récursive de fichiers." };
  }

  return null;
}

/* ------------------------------------------------------------------------ */
/* Base de données                                                           */
/* ------------------------------------------------------------------------ */

function jugerOutilBase(liste) {
  const texte = liste.join(" ");
  if (/\bsupabase\s+db\s+push\b/.test(texte) || /\bsupabase\s+db\s+reset\b.*--linked/.test(texte)) {
    return { decision: DEMANDE, raison: "MF-009 : cette commande modifie la base distante." };
  }
  if (/\bdrizzle-kit\s+push\b/.test(texte) || /\bprisma\s+db\s+push\b/.test(texte)) {
    return { decision: DEMANDE, raison: "MF-009 : push de schéma sans migration versionnée." };
  }
  if (/\bprisma\s+migrate\s+reset\b/.test(texte)) {
    return { decision: DEMANDE, raison: "MF-016 : cette commande efface la base." };
  }
  return null;
}

function jugerSql(texte) {
  if (SQL_DESTRUCTEUR.test(texte)) {
    return { decision: DEMANDE, raison: "MF-016 : requête SQL destructrice (DROP ou TRUNCATE)." };
  }
  if (DELETE_SANS_WHERE.test(texte)) {
    return { decision: DEMANDE, raison: "MF-016 : DELETE sans clause WHERE, toute la table serait vidée." };
  }
  return null;
}

/* ------------------------------------------------------------------------ */
/* Secrets                                                                   */
/* ------------------------------------------------------------------------ */

const FICHIER_ENV = /(^|[\s'"=/])\.env(\.(local|production|development|test|staging|[\w-]+\.local))?(?![\w.-])/g;

function jugerSecrets(commande) {
  for (const trouve of commande.matchAll(FICHIER_ENV)) {
    const avant = commande.slice(Math.max(0, trouve.index - 16), trouve.index + trouve[1].length);
    // Charger un fichier d'environnement pour exécuter un programme n'est pas le lire.
    if (/(--env-file[= ]|(^|\s)-e\s|--dotenv[= ])$/.test(avant)) continue;
    return {
      decision: REFUS,
      raison:
        "MF-006 : les fichiers d'environnement réels ne passent pas par l'agent. Demande à l'humain de les remplir, " +
        "et lis les valeurs via process.env dans le code. Seul .env.example se lit et s'écrit.",
    };
  }
  return null;
}

/* ------------------------------------------------------------------------ */
/* Entrée                                                                    */
/* ------------------------------------------------------------------------ */

/**
 * Juge une commande shell. `contexte` fournit l'état git, paresseusement :
 * branche(), amont(), aucunCommit(), refDistanteExiste(distant, branche).
 */
export function jugerCommande(commande, contexte) {
  // Les fichiers d'environnement se cherchent hors des chaînes : un message de
  // commit qui mentionne `.env` n'est pas une lecture. Les lectures entre
  // guillemets restent couvertes par les permissions `deny` de settings.json.
  let verdict = jugerSecrets(sansChaines(commande));
  // Le SQL, lui, vit dans les chaînes (`psql -c "DROP TABLE …"`), sauf quand la
  // commande n'est que git ou gh : là, c'est un message.
  const seulementGit = segments(commande).every((s) => ["git", "gh"].includes(mots(s)[0]));
  if (!seulementGit) verdict = pire(verdict, jugerSql(commande));

  // Une commande composée peut changer de branche avant de commiter :
  // `git switch -c feat/x && git commit …` ne commite pas sur la branche
  // courante. On suit donc la branche d'une sous-commande à l'autre.
  let brancheSuivie = null;
  const suivi = {
    ...contexte,
    branche: () => brancheSuivie ?? contexte.branche(),
    aucunCommit: () => (brancheSuivie ? false : contexte.aucunCommit()),
    amont: () => (brancheSuivie ? null : contexte.amont()),
  };

  for (const segment of segments(commande)) {
    const liste = mots(segment);
    if (!liste.length) continue;
    if (liste[0] === "git") {
      verdict = pire(verdict, jugerGit(liste, suivi));
      brancheSuivie = brancheApres(liste) ?? brancheSuivie;
    }
    verdict = pire(verdict, jugerSuppression(liste));
    verdict = pire(verdict, jugerOutilBase(liste));
  }
  return verdict;
}

/** La branche sur laquelle une sous-commande git laisse le dépôt, si elle en change. */
function brancheApres(liste) {
  const sous = liste[1];
  const args = liste.slice(2);
  const positions = args.filter((a) => !a.startsWith("-"));
  if (sous === "switch") {
    const creation = args.findIndex((a) => ["-c", "-C", "--create", "--force-create"].includes(a));
    if (creation !== -1) return args[creation + 1] ?? null;
    return positions[0] && positions[0] !== "-" ? positions[0] : null;
  }
  if (sous === "checkout") {
    const creation = args.findIndex((a) => a === "-b" || a === "-B");
    if (creation !== -1) return args[creation + 1] ?? null;
    if (args.includes("--") || args.includes(".")) return null;
    return positions.length === 1 && positions[0] !== "-" ? positions[0] : null;
  }
  return null;
}

/** Juge un appel d'outil tel que Claude Code le transmet au hook. */
export function juger(entree, contexte) {
  const outil = entree?.tool_name ?? "";
  const params = entree?.tool_input ?? {};
  if (outil === "Bash" || outil === "PowerShell") {
    return typeof params.command === "string" ? jugerCommande(params.command, contexte) : null;
  }
  if (/^mcp__.+__(execute_sql|apply_migration)$/.test(outil)) {
    const texte = Object.values(params).filter((v) => typeof v === "string").join("\n");
    return jugerSql(texte);
  }
  return null;
}

/** L'état git réel, interrogé seulement si une règle en a besoin. */
export function contexteGit(dossier) {
  const git = (...args) => {
    try {
      return execFileSync("git", args, { cwd: dossier, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch {
      return null;
    }
  };
  let branche;
  return {
    branche: () => (branche ??= git("branch", "--show-current") ?? ""),
    amont: () => {
      const ref = git("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}");
      return ref ? ref.split("/").slice(1).join("/") : null;
    },
    aucunCommit: () => git("rev-parse", "--verify", "--quiet", "HEAD") === null,
    refDistanteExiste: (distant, nom) => git("rev-parse", "--verify", "--quiet", `refs/remotes/${distant}/${nom}`) !== null,
  };
}

function principal() {
  let entree;
  try {
    entree = JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return;
  }
  const dossier = entree.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const verdict = juger(entree, contexteGit(dossier));
  if (!verdict) return;
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: verdict.decision,
        permissionDecisionReason: `Maedow Flow · ${verdict.raison}`,
      },
    }),
  );
}

const lanceDirectement =
  process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (lanceDirectement) principal();
