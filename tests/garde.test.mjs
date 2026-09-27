/**
 * Le garde doit refuser ce qu'il prétend refuser, et laisser passer le reste.
 *
 * Les deux moitiés comptent autant. Un garde qui ne refuse rien rend un verdict
 * favorable sans rien vérifier ; un garde qui refuse trop est désactivé dans
 * l'heure. Chaque cas légitime ci-dessous est un faux positif qu'on s'interdit.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { juger, jugerCommande } from "../templates/.claude/hooks/garde.mjs";

const GARDE = fileURLToPath(new URL("../templates/.claude/hooks/garde.mjs", import.meta.url));

/** Un état git simulé : sur une branche de feature, avec main et develop déjà sur le distant. */
function contexte(options = {}) {
  const etat = { branche: "feat/panier", amont: null, aucunCommit: false, distantes: ["main", "develop"], ...options };
  return {
    branche: () => etat.branche,
    amont: () => etat.amont,
    aucunCommit: () => etat.aucunCommit,
    refDistanteExiste: (_distant, nom) => etat.distantes.includes(nom),
  };
}

const decision = (commande, options) => jugerCommande(commande, contexte(options))?.decision ?? "silence";

test("MF-003 : pas de commit sur main ni develop", () => {
  assert.equal(decision('git commit -m "Ajoute le panier"', { branche: "main" }), "deny");
  assert.equal(decision('git commit -m "Ajoute le panier"', { branche: "develop" }), "deny");
  assert.equal(decision('git commit -m "Ajoute le panier"'), "silence");
});

test("MF-003 : une commande composée qui change de branche est jugée sur la bonne branche", () => {
  assert.equal(decision('git switch -c feat/socle develop && git add . && git commit -m "Socle"', { branche: "main" }), "silence");
  assert.equal(decision('git checkout -b fix/x && git commit -m "Correctif"', { branche: "develop" }), "silence");
  assert.equal(decision("git switch -c feat/x && git push -u origin HEAD", { branche: "develop" }), "silence");
  assert.equal(decision('git switch main && git commit -m "Oups"'), "deny");
  assert.equal(decision("git checkout develop && git push"), "deny");
  assert.equal(decision('git commit -m "Avant" && git switch -c feat/x', { branche: "main" }), "deny");
});

test("MF-003 : le premier commit d'un dépôt vide se confirme", () => {
  assert.equal(decision('git commit -m "Naissance"', { branche: "main", aucunCommit: true }), "ask");
});

test("MF-003 : pas de push vers main ou develop, sous toutes ses formes", () => {
  assert.equal(decision("git push origin main"), "deny");
  assert.equal(decision("git push origin develop"), "deny");
  assert.equal(decision("git push origin HEAD:main"), "deny");
  assert.equal(decision("git push origin feat/panier:develop"), "deny");
  assert.equal(decision("git push origin refs/heads/main"), "deny");
  assert.equal(decision("git push", { branche: "develop" }), "deny");
  assert.equal(decision("git push -u origin HEAD", { branche: "main" }), "deny");
  assert.equal(decision("git -C ../autre push origin main"), "deny");
  assert.equal(decision("git push --all"), "deny");
});

test("MF-003 : la branche de feature se pousse normalement", () => {
  assert.equal(decision("git push -u origin HEAD"), "silence");
  assert.equal(decision("git push origin feat/panier"), "silence");
  assert.equal(decision("git push", { amont: "feat/panier" }), "silence");
});

test("MF-003 : la naissance de main et develop sur le distant se confirme", () => {
  assert.equal(decision("git push -u origin main", { branche: "main", distantes: [] }), "ask");
  assert.equal(decision("git push -u origin main:develop", { branche: "main", distantes: ["main"] }), "ask");
});

test("MF-016 : le force push est refusé, le force-with-lease demandé", () => {
  assert.equal(decision("git push --force origin feat/panier"), "deny");
  assert.equal(decision("git push -f"), "deny");
  assert.equal(decision("git push origin +feat/panier"), "deny");
  assert.equal(decision("git push --force-with-lease origin feat/panier"), "ask");
});

test("MF-016 : contourner les hooks est refusé", () => {
  assert.equal(decision('git commit --no-verify -m "vite"'), "deny");
  assert.equal(decision('git commit -nm "vite"'), "deny");
  assert.equal(decision("git push --no-verify"), "deny");
  assert.equal(decision("git -c core.hooksPath=/dev/null commit -m x"), "deny");
  assert.equal(decision("git config --unset core.hooksPath"), "deny");
  assert.equal(decision("git config core.hooksPath autre"), "deny");
  assert.equal(decision("git config core.hooksPath .githooks"), "silence");
  assert.equal(decision("git config core.hooksPath"), "silence");
});

test("MF-016 : un message de commit ne déclenche rien par son contenu", () => {
  assert.equal(decision('git commit -m "Retire le push --force et le rm -rf du script"'), "silence");
  assert.equal(decision('git commit -m "Ajoute .env.local au .gitignore"'), "silence");
  assert.equal(decision('git commit -m "Supprime le DROP TABLE inutile"'), "silence");
});

test("MF-016 : les opérations qui perdent du travail se confirment", () => {
  assert.equal(decision("git reset --hard origin/develop"), "ask");
  assert.equal(decision("git clean -fd"), "ask");
  assert.equal(decision("git checkout -- src/app.ts"), "ask");
  assert.equal(decision("git restore src/app.ts"), "ask");
  assert.equal(decision("git restore --staged src/app.ts"), "silence");
  assert.equal(decision("git branch -D feat/vieux"), "ask");
  assert.equal(decision("git branch -d feat/fusionnee"), "silence");
  assert.equal(decision("git push origin --delete feat/vieux"), "ask");
  assert.equal(decision("git push origin --delete develop"), "deny");
  assert.equal(decision("git stash drop"), "ask");
  assert.equal(decision("git checkout -b feat/nouveau"), "silence");
});

test("MF-016 : suppression récursive, sauf dossiers régénérables", () => {
  assert.equal(decision("rm -rf src"), "ask");
  assert.equal(decision("rm -r docs"), "ask");
  assert.equal(decision("rm -rf node_modules .next"), "silence");
  assert.equal(decision("rm -rf ./dist/"), "silence");
  assert.equal(decision("rm fichier.txt"), "silence");
  assert.equal(decision("Remove-Item -Recurse -Force src"), "ask");
  assert.equal(decision("Remove-Item -Recurse -Force node_modules"), "silence");
  assert.equal(decision("npm ci && rm -rf src"), "ask");
});

test("MF-016 : SQL destructeur", () => {
  assert.equal(decision('psql "$DATABASE_URL" -c "DROP TABLE commandes"'), "ask");
  assert.equal(decision('psql -c "truncate commandes"'), "ask");
  assert.equal(decision('psql -c "DELETE FROM commandes;"'), "ask");
  assert.equal(decision("psql -c \"DELETE FROM commandes WHERE id = 3;\""), "silence");
  assert.equal(decision('psql -c "select * from commandes"'), "silence");
});

test("MF-016 : SQL destructeur passé par un serveur MCP", () => {
  const appel = (tool_name, query) => juger({ tool_name, tool_input: { query } }, contexte())?.decision ?? "silence";
  assert.equal(appel("mcp__supabase__execute_sql", "drop table commandes"), "ask");
  assert.equal(appel("mcp__claude_ai_Supabase__apply_migration", "alter table x drop column y"), "ask");
  assert.equal(appel("mcp__supabase__execute_sql", "select count(*) from commandes"), "silence");
});

test("MF-009 : pousser un schéma sans migration se confirme", () => {
  assert.equal(decision("npx drizzle-kit push"), "ask");
  assert.equal(decision("npx supabase db push"), "ask");
  assert.equal(decision("npx supabase db reset --linked"), "ask");
  assert.equal(decision("npx supabase db reset"), "silence");
  assert.equal(decision("npx prisma migrate reset"), "ask");
});

test("MF-006 : les fichiers d'environnement réels ne passent pas par l'agent", () => {
  assert.equal(decision("cat .env"), "deny");
  assert.equal(decision("cat .env.local"), "deny");
  assert.equal(decision("type .env.production"), "deny");
  assert.equal(decision("cp .env.example .env"), "deny");
  assert.equal(decision("echo SECRET=x >> .env.local"), "deny");
  assert.equal(decision("cat apps/web/.env.development.local"), "deny");
});

test("MF-006 : .env.example et le chargement d'un fichier d'environnement restent permis", () => {
  assert.equal(decision("cat .env.example"), "silence");
  assert.equal(decision("node --env-file=.env.local scripts/seed.mjs"), "silence");
  assert.equal(decision("npx dotenv -e .env.local -- npm run db:migrate"), "silence");
  assert.equal(decision("ls -la"), "silence");
});

test("de bout en bout : le hook lit l'état git réel et répond au format de Claude Code", () => {
  const dossier = mkdtempSync(join(tmpdir(), "maedow-flow-garde-"));
  const identite = ["-c", "user.name=Test", "-c", "user.email=test@exemple.ci"];
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: dossier });
  execFileSync("git", [...identite, "commit", "-q", "--allow-empty", "-m", "Naissance"], { cwd: dossier });

  const appeler = (command) =>
    spawnSync(process.execPath, [GARDE], {
      input: JSON.stringify({ hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: { command }, cwd: dossier }),
      encoding: "utf8",
    });

  const refus = appeler('git commit -m "Sur main"');
  assert.equal(refus.status, 0);
  const sortie = JSON.parse(refus.stdout).hookSpecificOutput;
  assert.equal(sortie.hookEventName, "PreToolUse");
  assert.equal(sortie.permissionDecision, "deny");
  assert.match(sortie.permissionDecisionReason, /MF-003/);

  const silence = appeler("git status");
  assert.equal(silence.status, 0);
  assert.equal(silence.stdout, "");

  const illisible = spawnSync(process.execPath, [GARDE], { input: "pas du json", encoding: "utf8" });
  assert.equal(illisible.status, 0);
  assert.equal(illisible.stdout, "");
});

test("un appel d'outil illisible ne bloque rien", () => {
  assert.equal(juger({}, contexte()), null);
  assert.equal(juger({ tool_name: "Bash", tool_input: {} }, contexte()), null);
  assert.equal(juger({ tool_name: "Read", tool_input: { file_path: "x" } }, contexte()), null);
});
