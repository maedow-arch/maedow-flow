/**
 * Le contrôle des textes doit savoir échouer. Un contrôle qui rend « conforme »
 * sur tout dépôt ressemble trait pour trait à un contrôle qui fonctionne.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("../scripts/controle-corpus.mjs", import.meta.url));

function corpus(fichiers) {
  const racine = mkdtempSync(join(tmpdir(), "maedow-flow-corpus-"));
  mkdirSync(join(racine, "corpus"));
  for (const [nom, contenu] of Object.entries(fichiers)) writeFileSync(join(racine, "corpus", nom), contenu);
  return spawnSync(process.execPath, [SCRIPT, racine], { encoding: "utf8" });
}

test("un corpus propre passe, ancres accentuées et code compris", () => {
  const r = corpus({
    "a.md": "# A\n\nVoir [la règle](b.md#mf-006--les-secrets-restent-hors-de-portée) et `texte — suite`.\n",
    "b.md": "# B\n\n## MF-006 · Les secrets restent hors de portée\n",
  });
  assert.equal(r.status, 0, r.stderr);
});

test("un tiret d'incise dans la prose échoue", () => {
  const r = corpus({ "a.md": "# A\n\nUn texte — avec une incise.\n" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /tiret d'incise/);
});

test("un lien vers un fichier absent échoue", () => {
  const r = corpus({ "a.md": "# A\n\n[absent](nulle-part.md)\n" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /fichier absent/);
});

test("une ancre introuvable échoue", () => {
  const r = corpus({ "a.md": "# A\n\n[règle](b.md#titre-renomme)\n", "b.md": "# B\n\n## Titre d'origine\n" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /ancre introuvable/);
});
