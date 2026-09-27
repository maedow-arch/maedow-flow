/**
 * Les adresses publiques du projet, définies une seule fois pour le site.
 *
 * `SITE` dans scripts/flow.mjs porte la même adresse de production pour les
 * fichiers pour agents : changer l'une impose de changer l'autre.
 *
 * Une prévisualisation Vercel s'annonce sous sa propre adresse, pour qu'une
 * branche ne se fasse pas passer pour la production dans ses métadonnées.
 */
const PRODUCTION = "https://maedow-flow.vercel.app";

export const SITE_URL =
  process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : PRODUCTION;

export const REPO_URL = "https://github.com/maedow-arch/maedow-flow";
export const ARCH_URL = "https://maedow-arch-docs.vercel.app";
export const SKILLS_URL = "https://github.com/JavaScript-Mastery-Pro/skills";

/** Le premier message à donner à un agent, dans un dossier vide ou un projet existant. */
export const PROMPT_AMORCAGE = `Ce projet suit Maedow Flow. Avant toute action, lis le corpus en texte brut :
curl -fsSL ${PRODUCTION}/llms-full.txt

Applique ensuite la procédure de la page Démarrer qui correspond à ce dossier
(nouveau projet ou projet existant). N'écris aucun code applicatif tant que je
n'ai pas validé le scope et la stack.

L'idée : <pour qui, quel problème, et ce qui prouvera que ça marche>`;
