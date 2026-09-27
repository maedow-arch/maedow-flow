import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { REPO_URL } from "@/lib/site";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{ title: "Maedow Flow", url: "/" }}
      githubUrl={REPO_URL}
      links={[{ text: "llms.txt", url: "/llms.txt", external: true }]}
    >
      {children}
    </DocsLayout>
  );
}
