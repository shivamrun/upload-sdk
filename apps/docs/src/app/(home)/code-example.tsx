"use client";

import {
  Check,
  Clipboard,
  FileCode2,
  type LucideIcon,
  PanelsTopLeft,
  Route as RouteIcon,
  Workflow,
} from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import { useState } from "react";

type ExampleKey = "browser" | "route" | "config";
type CodeLanguage = "tsx" | "typescript";

type Example = {
  label: string;
  title: string;
  mobileDescription: string;
  desktopDescription: string;
  details: string[];
  filename: string;
  icon: LucideIcon;
  language: CodeLanguage;
  code: string;
};

const COPY_RESET_DELAY = 1600;

const browserCode = `"use client";

import { useRef, useState } from "react";

export function UploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function uploadFile(file: File) {
    setUploading(true);

    try {
      const targetResponse = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!targetResponse.ok) {
        throw new Error("Unable to prepare upload");
      }

      const target = await targetResponse.json();

      const uploadResponse = await fetch(target.url, {
        method: target.method,
        headers: target.headers,
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/png,image/jpeg"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            void uploadFile(file);
          }
        }}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading..." : "Choose a file"}
      </button>
    </>
  );
}`;

const routeCode = `import { uploader } from "@/lib/upload-config";

export async function POST(request: Request) {
  const file = await request.json();

  const target = await uploader.prepareUpload("avatar", {
    filename: file.filename,
    contentType: file.contentType,
    size: file.size,
  });

  return Response.json(target);
}`;

const uploadConfigCode = `import { awsS3 } from "@upload-sdk/aws-s3";
import { createUploader, defineAssets } from "upload-sdk";

import { env } from "@/env";
import { s3 } from "@/lib/s3";

// Storage
const storageProfiles = {
  userUploads: awsS3({
    client: s3,
    bucket: env.AWS_S3_BUCKET,
  }),
};

// Asset rules
const assets = defineAssets(storageProfiles, {
  avatar: {
    storage: "userUploads",
    accept: {
      mimeTypes: ["image/png", "image/jpeg"],
    },
    limits: {
      maxFileSize: {
        value: 2,
        unit: "MB",
      },
    },
  },
});

// Uploader
export const uploader = createUploader({
  storageProfiles,
  assets,
});`;

const examples = {
  browser: {
    label: "Browser",
    title: "Choose and upload the file",
    mobileDescription: "Select a file and request an upload target.",
    desktopDescription:
      "The browser collects the selected file and sends only its name, content type, and size to your route handler. Once it receives a secure upload target, it uploads the file directly to the storage provider.",
    details: [
      "Sends file metadata to your API",
      "Receives a secure upload target",
      "Uploads the file directly to storage",
    ],
    filename: "UploadButton.tsx",
    icon: PanelsTopLeft,
    language: "tsx",
    code: browserCode,
  },

  route: {
    label: "Route handler",
    title: "Prepare a secure upload",
    mobileDescription: "Validate the request and prepare the upload.",
    desktopDescription:
      "The route handler receives the file metadata and calls prepareUpload() with the avatar asset rule. Upload SDK validates the request and returns the provider-specific instructions needed by the browser.",
    details: [
      "Runs only on your server",
      "Validates the selected asset rule",
      "Returns short-lived upload instructions",
    ],
    filename: "src/app/api/upload/route.ts",
    icon: RouteIcon,
    language: "typescript",
    code: routeCode,
  },

  config: {
    label: "SDK Usage",
    title: "Configure Upload SDK",
    mobileDescription: "Connect storage and define your upload rules.",
    desktopDescription:
      "The SDK configuration connects your storage provider, defines which files users may upload, and creates the uploader used by your route handler. You can add more asset rules or providers without changing the browser flow.",
    details: [
      "Connect AWS S3 or another provider",
      "Define file types and size limits",
      "Create one reusable uploader",
    ],
    filename: "src/lib/upload-config.ts",
    icon: Workflow,
    language: "typescript",
    code: uploadConfigCode,
  },
} satisfies Record<ExampleKey, Example>;

const exampleKeys: ExampleKey[] = ["browser", "route", "config"];

export function CodeExample() {
  const [activeExample, setActiveExample] = useState<ExampleKey>("browser");

  const [copied, setCopied] = useState(false);

  const example = examples[activeExample];

  function selectExample(key: ExampleKey) {
    setActiveExample(key);
    setCopied(false);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(example.code.trim());
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, COPY_RESET_DELAY);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl border-x border-b">
      <div className="border-b px-4 py-10 text-center sm:px-6 sm:py-12 lg:px-8">
        <h2
          style={{ fontFamily: "var(--font-geist)" }}
          className="mx-auto  max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
        >
          See the complete upload flow
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-fd-muted-foreground sm:text-lg">
          The browser asks your route handler for a secure upload target, then
          sends the file directly to your storage provider.
        </p>
      </div>

      <div className="grid lg:grid-cols-[0.7fr_1.3fr]">
        <div className="border-b p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-10 xl:p-12">
          <MobileCards activeExample={activeExample} onSelect={selectExample} />

          <DesktopExplanation example={example} />
        </div>

        <div className="min-w-0 bg-fd-muted/20">
          <div className="overflow-hidden bg-[#050505] shadow-sm">
            <CodeTabs activeExample={activeExample} onSelect={selectExample} />

            <CodeFileHeader
              copied={copied}
              example={example}
              onCopy={copyCode}
            />

            <div
              id={`panel-${activeExample}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeExample}`}
            >
              <CodeBlock code={example.code} language={example.language} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileCards({
  activeExample,
  onSelect,
}: {
  activeExample: ExampleKey;
  onSelect: (key: ExampleKey) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:hidden">
      {exampleKeys.map((key) => {
        const example = examples[key];
        const Icon = example.icon;
        const active = activeExample === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={[
              "flex min-w-0 flex-col rounded-lg border p-4 text-left transition-colors",
              active
                ? "border-blue-500/40 bg-blue-500/10"
                : "bg-fd-background hover:bg-fd-muted/35",
            ].join(" ")}
          >
            <div
              className={[
                "flex size-9 items-center justify-center rounded-md border",
                active
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-500"
                  : "bg-fd-muted/40 text-fd-muted-foreground",
              ].join(" ")}
            >
              <Icon className="size-4" />
            </div>

            <h3
              style={{ fontFamily: "var(--font-geist)" }}
              className="mt-4 font-semibold"
            >
              {example.label}
            </h3>

            <p className="mt-1.5 text-sm leading-6 text-fd-muted-foreground">
              {example.mobileDescription}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function DesktopExplanation({ example }: { example: Example }) {
  const Icon = example.icon;

  return (
    <div className="hidden lg:block">
      <div className="flex size-10 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-500">
        <Icon className="size-5" />
      </div>

      <h3
        style={{ fontFamily: "var(--font-geist)" }}
        className="mt-8 text-2xl font-semibold leading-tight tracking-tight"
      >
        {example.title}
      </h3>

      <p className="mt-4 text-[15px] leading-7 text-fd-muted-foreground">
        {example.desktopDescription}
      </p>

      <div className="mt-10">
        <p className="text-sm text-fd-muted-foreground">What happens here:</p>

        <ul className="mt-4 space-y-3">
          {example.details.map((detail) => (
            <li
              key={detail}
              className="flex items-start gap-3 text-sm leading-6"
            >
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-500" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CodeTabs({
  activeExample,
  onSelect,
}: {
  activeExample: ExampleKey;
  onSelect: (key: ExampleKey) => void;
}) {
  return (
    <div className="border-b border-white/10">
      <div
        role="tablist"
        aria-label="Upload example files"
        className="grid min-w-0 grid-cols-3"
      >
        {exampleKeys.map((key) => {
          const example = examples[key];
          const Icon = example.icon;
          const active = activeExample === key;

          return (
            <button
              key={key}
              id={`tab-${key}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${key}`}
              onClick={() => onSelect(key)}
              className={[
                "inline-flex min-h-14 min-w-0 items-center justify-center gap-2 border-r border-white/10 px-2 text-sm font-medium transition-colors last:border-r-0 sm:min-h-16 sm:px-5 sm:text-base",
                active
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200",
              ].join(" ")}
            >
              <Icon className="size-4 shrink-0" />
              <span className="min-w-0 truncate">{example.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CodeFileHeader({
  copied,
  example,
  onCopy,
}: {
  copied: boolean;
  example: Example;
  onCopy: () => void;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 border-b border-white/10 px-4 text-xs text-neutral-500">
      <div className="flex min-w-0 items-center gap-2">
        <FileCode2 className="size-3.5 shrink-0" />
        <span className="truncate">{example.filename}</span>
      </div>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copy ${example.filename}`}
        className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
      >
        {copied ? (
          <>
            <Check className="size-3.5" />
            Copied
          </>
        ) : (
          <>
            <Clipboard className="size-3.5" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: CodeLanguage;
}) {
  return (
    <div className="max-h-[560px] overflow-auto">
      <Highlight theme={themes.vsDark} code={code.trim()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} min-w-max bg-transparent p-4 text-[13px] leading-6 sm:p-5 sm:text-sm`}
            style={{
              ...style,
              margin: 0,
              background: "transparent",
              fontFamily:
                "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          >
            {(() => {
              const lineKeyCounts = new Map<string, number>();

              return tokens.map((line, lineIndex) => {
                const lineProps = getLineProps({ line });
                const lineSignature = line
                  .map((token) => `${token.content}:${token.types.join(".")}`)
                  .join("|");
                const lineKeyCount = lineKeyCounts.get(lineSignature) ?? 0;
                const tokenKeyCounts = new Map<string, number>();

                lineKeyCounts.set(lineSignature, lineKeyCount + 1);

                return (
                  <span
                    key={`${lineSignature}-${lineKeyCount}`}
                    {...lineProps}
                    className={`${lineProps.className ?? ""} block min-w-max`}
                  >
                    <span
                      aria-hidden="true"
                      className="mr-5 inline-block w-7 select-none text-right text-neutral-700"
                    >
                      {lineIndex + 1}
                    </span>

                    <span className="whitespace-pre">
                      {line.map((token) => {
                        const tokenSignature = `${token.content}:${token.types.join(".")}`;
                        const tokenKeyCount =
                          tokenKeyCounts.get(tokenSignature) ?? 0;

                        tokenKeyCounts.set(tokenSignature, tokenKeyCount + 1);

                        return (
                          <span
                            key={`${tokenSignature}-${tokenKeyCount}`}
                            {...getTokenProps({ token })}
                          />
                        );
                      })}
                    </span>
                  </span>
                );
              });
            })()}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
