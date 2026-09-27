import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fichierDuCorpus, source } from "@/lib/source";

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full ?? false}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      {/* La même page, en Markdown brut : ce qu'un agent lit sans passer par le HTML. */}
      <p className="-mt-4 mb-6 text-sm text-fd-muted-foreground">
        Version texte pour agents :{" "}
        <a className="underline underline-offset-4" href={`/md/${fichierDuCorpus(slug)}`}>
          /md/{fichierDuCorpus(slug)}
        </a>
      </p>
      <DocsBody>
        <MDX components={defaultMdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description ?? null,
    alternates: { types: { "text/markdown": `/md/${fichierDuCorpus(slug)}` } },
  };
}
