/**
 * Une question, une réponse, en `<details>` : l'accordéon marche sans
 * JavaScript, dans l'esprit du reste du site. Le signe (+ / ×) est du CSS pur,
 * jamais un état React.
 */
export function Faq({ items }: { items: { question: string; reponse: string }[] }) {
  return (
    <div data-anime="carte" className="divide-y overflow-hidden rounded-xl border bg-fd-card">
      {items.map((item) => (
        <details key={item.question} className="group p-5 open:pb-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:content-none">
            {item.question}
            <span
              aria-hidden="true"
              className="relative inline-flex size-5 shrink-0 items-center justify-center text-fd-primary"
            >
              <span className="absolute h-0.5 w-3 bg-current" />
              <span className="absolute h-3 w-0.5 bg-current transition-transform group-open:scale-y-0" />
            </span>
          </summary>
          <p className="mt-3 text-sm text-fd-muted-foreground">{item.reponse}</p>
        </details>
      ))}
    </div>
  );
}
