import type { Metadata } from "next";
import { appName, docsImageRoute, gitConfig, packageName } from "./shared";

const fallbackSiteUrl = "https://upload-sdk.dev";
const repositoryUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
const npmPackageUrl = `https://www.npmjs.com/package/${packageName}`;

export const siteDescription =
  "Provider-agnostic TypeScript upload SDK for generating signed browser upload targets for S3 and ImageKit with strict validation, typed asset rules, and publish-ready provider helpers.";

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
    return new URL(rawUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

export const siteUrl = createSiteUrl();
export const ogImageUrl = new URL(`${docsImageRoute}/image.png`, siteUrl);

export function toAbsoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export const metadata: Metadata = {
  title: {
    default:
      "Upload SDK - Provider-Agnostic Signed Uploads for S3 and ImageKit",
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
    canonical: "/",
  },
  openGraph: {
    title: "Upload SDK - Provider-Agnostic Signed Uploads for S3 and ImageKit",
    description:
      "Generate signed direct-upload targets for S3 and ImageKit with strict validation, typed asset rules, and provider-safe upload constraints.",
    url: siteUrl.toString(),
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
    title: "Upload SDK - Provider-Agnostic Signed Uploads for S3 and ImageKit",
    description:
      "Typed upload configuration, strict validation, and signed direct-upload targets for S3 and ImageKit.",
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
      name: appName,
      alternateName: "Provider-Agnostic Upload SDK",
      url: siteUrl.toString(),
      description: siteDescription,
      publisher: {
        "@type": "Organization",
        name: "marinedotsh",
        url: `https://github.com/${gitConfig.user}`,
      },
    },
    {
      "@type": "SoftwareSourceCode",
      name: appName,
      alternateName: "Provider-Agnostic Upload SDK",
      url: siteUrl.toString(),
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
