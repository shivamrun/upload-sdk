import type { Metadata } from "next";
import { appName, docsImageRoute, gitConfig, packageName } from "./shared";

const fallbackSiteUrl = "https://upload-sdk.dev";
const repositoryUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
const npmPackageUrl = `https://www.npmjs.com/package/${packageName}`;

export const siteTitle =
  "Upload SDK - Typed Direct Uploads for S3 and ImageKit";
export const siteDescription =
  "TypeScript SDK for signed direct uploads to AWS S3 and ImageKit with typed asset rules, strict validation, and server-side credentials.";

export const siteKeywords = [
  "upload sdk",
  packageName,
  "TypeScript upload SDK",
  "signed uploads",
  "direct browser uploads",
  "provider-agnostic uploads",
  "S3 presigned uploads",
  "S3 POST policy",
  "ImageKit uploads",
  "ImageKit upload JWT",
  "file upload validation",
  "typed upload config",
  "asset upload rules",
  "Node.js upload SDK",
  "Next.js uploads",
  "server-side upload signatures",
];

function createSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl;

  try {
    const url = new URL(rawUrl);
    return new URL(url.origin);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

export const siteUrl = createSiteUrl();
export const siteBaseUrl = siteUrl.origin;
export const ogImageUrl = new URL(`${docsImageRoute}/image.png`, siteUrl);

export function toAbsoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: `%s | ${appName}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  authors: [
    {
      name: "Shivam Gupta",
      url: "https://github.com/shivamrun",
    },
  ],
  creator: "Shivam Gupta",
  publisher: "marinedotsh",
  applicationName: appName,
  category: "Developer tools",
  icons: {
    icon: "/upload-sdk.svg",
  },
  metadataBase: siteUrl,
  alternates: {
    canonical: siteBaseUrl,
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteBaseUrl,
    siteName: appName,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: ogImageUrl.toString(),
        width: 1200,
        height: 630,
        alt: "Upload SDK documentation and provider-agnostic signed upload tooling",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImageUrl.toString()],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "npm:package": packageName,
    "github:repository": `${gitConfig.user}/${gitConfig.repo}`,
  },
};

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteBaseUrl}/#website`,
      name: appName,
      alternateName: "Provider-Agnostic Upload SDK",
      url: siteBaseUrl,
      description: siteDescription,
      inLanguage: "en-US",
      publisher: {
        "@type": "Organization",
        name: "marinedotsh",
        url: `https://github.com/${gitConfig.user}`,
      },
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": `${siteBaseUrl}/#source-code`,
      name: appName,
      alternateName: "Provider-Agnostic Upload SDK",
      url: siteBaseUrl,
      codeRepository: repositoryUrl,
      sameAs: [repositoryUrl, npmPackageUrl],
      description: siteDescription,
      license: `${repositoryUrl}/blob/${gitConfig.branch}/packages/upload-sdk/LICENSE`,
      programmingLanguage: "TypeScript",
      runtimePlatform: "Node.js >=18",
      applicationCategory: "DeveloperTool",
      isAccessibleForFree: true,
      keywords: siteKeywords,
      author: {
        "@type": "Person",
        name: "Shivam Gupta",
        url: "https://github.com/shivamrun",
      },
      publisher: {
        "@type": "Organization",
        name: "marinedotsh",
        url: `https://github.com/${gitConfig.user}`,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        url: npmPackageUrl,
        itemOffered: {
          "@type": "SoftwareApplication",
          name: packageName,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Node.js",
        },
      },
      about: [
        "Provider-agnostic upload signing",
        "S3 presigned POST uploads",
        "ImageKit upload JWTs",
        "File upload validation",
        "Typed asset upload configuration",
      ],
    },
  ],
};
