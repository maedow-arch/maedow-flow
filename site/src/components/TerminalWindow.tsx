"use client";

import { useState } from "react";

/**
 * Une fenêtre terminal avec barre de titre et bouton de copie.
 *
 * Remplace BlocTexte sur la page d'accueil : même contenu, mais l'habillage
 * est propre au site, sans dépendre des styles internes de Fumadocs.
 */
export function TerminalWindow({
  title,
  code,
}: {
  title: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flow-terminal overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      <div className="flex items-center gap-2 border-b border-fd-border px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 font-mono text-xs text-fd-muted-foreground">{title}</span>
        <button
          onClick={handleCopy}
          className="ml-auto rounded-md px-2 py-0.5 font-mono text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
          aria-label="Copier le code"
        >
          {copied ? "copié ✓" : "copier"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code>
            {code.split("\n").map((line, i) => (
              <span key={i} className="block">
                {line || "\u00A0"}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
