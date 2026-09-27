/**
 * Les hooks git du kit, exécutés comme git les exécute : par sh, avec leurs
 * vraies entrées. Un hook qui ne s'exécute pas (fins de ligne, droits, syntaxe)
 * ne refuse rien, et ce silence ressemble à un succès.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HOOKS = fileURLToPath(new URL("../templates/.githooks/", import.meta.url));
const ZERO = "0".repeat(40);
const A = "a".repeat(40);
const B = "b".repeat(40);

function prePush(lignes) {
  const r = spawnSync("sh", [join(HOOKS, "pre-push"), "origin", "git@exemple:depot.git"], {
    input: lignes.map((l) => `${l}\n`).join(""),
    encoding: "utf8",
  });
  return r.status;
}

function commitMsg(message) {
  const dossier = mkdtempSync(join(tmpdir(), "maedow-flow-"));
  const fichier = join(dossier, "COMMIT_EDITMSG");
  writeFileSync(fichier, message);
  return spawnSync("sh", [join(HOOKS, "commit-msg"), fichier], { encoding: "utf8" }).status;
}

test("pre-push : la mise à jour directe de main et develop est refusée", () => {
  assert.equal(prePush([`refs/heads/main ${A} refs/heads/main ${B}`]), 1);
  assert.equal(prePush([`refs/heads/x ${A} refs/heads/develop ${B}`]), 1);
});

test("pre-push : la suppression de main est refusée", () => {
  assert.equal(prePush([`(delete) ${ZERO} refs/heads/main ${B}`]), 1);
});

test("pre-push : la naissance de main et develop est permise", () => {
  assert.equal(prePush([`refs/heads/main ${A} refs/heads/main ${ZERO}`]), 0);
  assert.equal(prePush([`refs/heads/main ${A} refs/heads/develop ${ZERO}`]), 0);
});

test("pre-push : une branche de feature passe ; mêlée à une référence interdite, tout le push est refusé", () => {
  assert.equal(prePush([`refs/heads/feat/x ${A} refs/heads/feat/x ${B}`]), 0);
  assert.equal(prePush([`refs/heads/feat/x ${A} refs/heads/feat/x ${ZERO}`]), 0);
  assert.equal(prePush([`refs/heads/feat/x ${A} refs/heads/feat/x ${B}`, `refs/heads/main ${A} refs/heads/main ${B}`]), 1);
});

test("commit-msg : un message propre passe, coauteur humain compris", () => {
  assert.equal(commitMsg("Le panier refuse une quantité supérieure au stock\n"), 0);
  assert.equal(commitMsg("Le panier refuse une quantité supérieure au stock\n\nCo-Authored-By: Awa Koné <awa@exemple.ci>\n"), 0);
});

test("commit-msg : l'attribution à un outil est refusée", () => {
  assert.equal(commitMsg("feat: panier\n\nCo-Authored-By: Claude Opus <noreply@anthropic.com>\n"), 1);
  assert.equal(commitMsg("feat: panier\n\nco-authored-by: GitHub Copilot <x@y.z>\n"), 1);
  assert.equal(commitMsg("Le panier\n\n🤖 Generated with Claude Code\n"), 1);
});

test("commit-msg : le tiret cadratin est refusé", () => {
  assert.equal(commitMsg("Le panier — refuse le stock négatif\n"), 1);
  assert.equal(commitMsg("Le panier – refuse le stock négatif\n"), 1);
});

test("commit-msg : les lignes de commentaire et le diff de git commit -v sont ignorés", () => {
  const message = [
    "Le panier refuse le stock négatif",
    "# Co-Authored-By: Claude <noreply@anthropic.com>",
    "# ------------------------ >8 ------------------------",
    "diff --git a/x b/x",
    "+ // texte — avec un tiret",
    "",
  ].join("\n");
  assert.equal(commitMsg(message), 0);
});
