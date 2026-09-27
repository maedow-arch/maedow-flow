/**
 * Le script d'installation sur de vrais dossiers temporaires : un projet neuf,
 * un projet qui a déjà ses fichiers, et le contrôle qui doit voir la différence.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cheminPublie, composerVerify, controler, installer } from "../scripts/flow.mjs";

const MANIFESTE = JSON.parse(readFileSync(new URL("../templates/manifest.json", import.meta.url), "utf8"));

function projet({ git = true, paquet } = {}) {
  const dossier = mkdtempSync(join(tmpdir(), "maedow-flow-projet-"));
  if (paquet) writeFileSync(join(dossier, "package.json"), `${JSON.stringify(paquet, null, 2)}\n`);
  if (git) execFileSync("git", ["init", "-q", "-b", "main"], { cwd: dossier });
  return dossier;
}

test("le dépôt applique la version courante de son propre kit", () => {
  // Le dépôt s'est installé son kit ; une correction du modèle doit l'atteindre aussi.
  const racine = new URL("../", import.meta.url);
  for (const f of [".claude/hooks/garde.mjs", ".claude/settings.json", ".githooks/pre-push", ".githooks/commit-msg"]) {
    assert.equal(readFileSync(new URL(f, racine), "utf8"), readFileSync(new URL(`templates/${f}`, racine), "utf8"), f);
  }
});

test("cheminPublie remplace le point de tête de chaque segment", () => {
  assert.equal(cheminPublie(".claude/settings.json"), "_claude/settings.json");
  assert.equal(cheminPublie(".github/workflows/ci.yml"), "_github/workflows/ci.yml");
  assert.equal(cheminPublie("AGENTS.md"), "AGENTS.md");
});

test("composerVerify n'enchaîne que les contrôles déclarés, et écarte le faux test d'npm init", () => {
  assert.equal(composerVerify({ lint: "eslint .", build: "next build" }, "npm"), "npm run lint && npm run build");
  assert.equal(
    composerVerify({ lint: "x", typecheck: "x", test: "x", build: "x" }, "pnpm"),
    "pnpm run lint && pnpm run typecheck && pnpm run test && pnpm run build",
  );
  assert.equal(composerVerify({ test: 'echo "Error: no test specified" && exit 1' }, "npm"), null);
});

test("installer pose tout le kit dans un projet neuf", async () => {
  const dossier = projet({ paquet: { name: "neuf", scripts: { lint: "eslint .", build: "next build" } } });
  writeFileSync(join(dossier, "tsconfig.json"), "{}\n");

  const rapport = await installer({ cible: dossier });

  assert.deepEqual(rapport.laisses, []);
  for (const f of MANIFESTE.fichiers) assert.ok(existsSync(join(dossier, f.destination)), f.destination);

  const scripts = JSON.parse(readFileSync(join(dossier, "package.json"), "utf8")).scripts;
  assert.equal(scripts.typecheck, "tsc --noEmit");
  assert.equal(scripts.verify, "npm run lint && npm run typecheck && npm run build");
  assert.match(scripts.prepare, /core\.hooksPath \.githooks/);

  assert.match(readFileSync(join(dossier, ".gitignore"), "utf8"), /^\.env\.local$/m);
  assert.equal(execFileSync("git", ["config", "core.hooksPath"], { cwd: dossier, encoding: "utf8" }).trim(), ".githooks");

  const index = execFileSync("git", ["ls-files", "-s", ".githooks"], { cwd: dossier, encoding: "utf8" });
  assert.match(index, /^100755 .*pre-push$/m, "le hook doit être exécutable dans l'index");
});

test("installer n'écrase jamais un fichier existant", async () => {
  const dossier = projet();
  writeFileSync(join(dossier, "AGENTS.md"), "# Mon contexte à moi\n");
  mkdirSync(join(dossier, ".github"), { recursive: true });
  writeFileSync(join(dossier, ".github", "pull_request_template.md"), "maison\n");

  const rapport = await installer({ cible: dossier });

  assert.equal(readFileSync(join(dossier, "AGENTS.md"), "utf8"), "# Mon contexte à moi\n");
  assert.equal(readFileSync(join(dossier, ".github", "pull_request_template.md"), "utf8"), "maison\n");
  assert.deepEqual(rapport.laisses.sort(), [".github/pull_request_template.md", "AGENTS.md"]);
});

test("installer adapte la commande verify au gestionnaire de paquets", async () => {
  const dossier = projet({ paquet: { name: "p", scripts: { test: "vitest run" } } });
  writeFileSync(join(dossier, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");

  await installer({ cible: dossier });

  assert.match(readFileSync(join(dossier, "AGENTS.md"), "utf8"), /pnpm run verify/);
  assert.equal(JSON.parse(readFileSync(join(dossier, "package.json"), "utf8")).scripts.verify, "pnpm run test");
});

test("installer respecte un .gitignore qui couvre déjà .env*", async () => {
  const dossier = projet();
  writeFileSync(join(dossier, ".gitignore"), "node_modules\n.env*\n");

  await installer({ cible: dossier });

  const gitignore = readFileSync(join(dossier, ".gitignore"), "utf8");
  assert.doesNotMatch(gitignore, /^\.env\.local$/m);
  assert.match(gitignore, /^\.claude\/settings\.local\.json$/m);
});

test("controler voit les écarts, puis la conformité", async () => {
  const dossier = projet({ paquet: { name: "c", scripts: { lint: "eslint ." } } });

  const avant = await controler({ cible: dossier });
  assert.ok(avant.some((c) => !c.ok && c.libelle === "AGENTS.md"));

  await installer({ cible: dossier });
  // Une branche n'existe pour git qu'à partir de son premier commit.
  const identite = ["-c", "user.name=Test", "-c", "user.email=test@exemple.ci"];
  execFileSync("git", [...identite, "commit", "-q", "--allow-empty", "-m", "Naissance du dépôt"], { cwd: dossier });
  execFileSync("git", ["branch", "develop"], { cwd: dossier });
  const apres = await controler({ cible: dossier });
  const ecarts = apres.filter((c) => !c.ok).map((c) => c.libelle);

  // Seuls restent les champs d'AGENTS.md que l'humain, /audit et /scope remplissent.
  assert.deepEqual(ecarts, ["AGENTS.md sans champ à compléter"]);
  const trous = apres.find((c) => c.libelle === "AGENTS.md sans champ à compléter").conseil;
  assert.match(trous, /^7 champ/, "le nom du projet, le produit, le hors périmètre, Stack, Build approach, Commands, Rules");

  // Une fois les champs remplis, le commentaire d'en-tête, qui cite les marqueurs, ne compte pas.
  const agents = join(dossier, "AGENTS.md");
  writeFileSync(
    agents,
    readFileSync(agents, "utf8")
      .replace("<Nom du projet>", "Essai")
      .replace(/<à compléter[^>]*>/g, "Rempli.")
      .replace(/(\n## \w[^\n]*\n\n)<(to be filled|TBD[^>]*)>/g, "$1Rempli."),
  );
  const rempli = await controler({ cible: dossier });
  assert.deepEqual(rempli.filter((c) => !c.ok).map((c) => c.libelle), []);
});
