import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
} from "fumadocs-ui/layouts/docs/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx";
import { ViewOptionsPopover } from "@/components/view-options-popover";
import { toAbsoluteUrl } from "@/lib/metadata";
import { getPageImage, getPageMarkdownUrl, source } from "@/lib/source";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const pageUrl = toAbsoluteUrl(page.url);

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      footer={{ enabled: false }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0 text-base">
        {page.data.description}
      </DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={toAbsoluteUrl(markdownUrl)}
          pageUrl={pageUrl}
        />
      </div>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();
  const image = getPageImage(page);

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: toAbsoluteUrl(page.url),
    },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: toAbsoluteUrl(page.url),
      type: "article",
      images: [
        {
          url: toAbsoluteUrl(image.url),
          width: 1200,
          height: 630,
          alt: `${page.data.title} - Upload SDK documentation`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.data.title,
      description: page.data.description,
      images: [toAbsoluteUrl(image.url)],
    },
  };
}
