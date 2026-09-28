"use client";

import { useState } from "react";

/**
 * Une carte de code propre : en-tête avec nom de fichier et bouton copier,
 * sans les points macOS. Pensée pour le hero, où le code est un visuel
 * et non un terminal.
 */
export function CodeCard({
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
    <div className="flow-terminal overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-2xl shadow-black/20">
      <div className="flex items-center border-b border-fd-border px-4 py-2.5">
        <span className="font-mono text-xs text-fd-muted-foreground">{title}</span>
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
