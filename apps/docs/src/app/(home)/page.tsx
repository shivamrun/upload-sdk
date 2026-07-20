import {
  ArrowRight,
  Check,
  GitBranch,
  Package,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";

const highlights = [
  "Typed asset rules",
  "S3 POST policies",
  "ImageKit upload JWTs",
  "Validation before signing",
];

const installCommands = [
  "pnpm add @marinedotsh/upload-sdk",
  "bun add @marinedotsh/upload-sdk",
];

export default function HomePage() {
  return (
    <main className="flex-1 bg-fd-background text-fd-foreground">
      <section className="relative overflow-hidden border-b bg-fd-muted/20">
        <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl flex-col items-center justify-center gap-10 px-6 py-14 md:px-8 lg:py-16">
          <div className="flex max-w-3xl flex-col items-center text-center">
            <div className="mb-5 flex items-center justify-center gap-3 text-sm font-medium text-fd-muted-foreground">
              <span className="inline-flex size-9 items-center justify-center rounded-md border bg-fd-background">
                <UploadCloud
                  className="size-4 text-emerald-500"
                  aria-hidden="true"
                />
              </span>
              Direct browser uploads for modern TypeScript apps
            </div>
            <h1 className="text-5xl font-semibold tracking-normal text-balance sm:text-6xl lg:text-7xl">
              Upload SDK
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-fd-muted-foreground">
              Generate provider-agnostic signed upload targets for S3 and
              ImageKit with strict validation, typed asset rules, and
              provider-safe constraints.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/docs"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-fd-primary px-5 text-sm font-medium text-fd-primary-foreground transition hover:bg-fd-primary/90"
              >
                Read docs
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="https://www.npmjs.com/package/@marinedotsh/upload-sdk"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-fd-background px-5 text-sm font-medium transition hover:bg-fd-accent"
              >
                <Package className="size-4" aria-hidden="true" />
                npm package
              </Link>
              <Link
                href="https://github.com/marinedotsh/upload-sdk"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-fd-background px-5 text-sm font-medium transition hover:bg-fd-accent"
              >
                <GitBranch className="size-4" aria-hidden="true" />
                GitHub
              </Link>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-fd-muted-foreground sm:grid-cols-2">
              {highlights.map((highlight) => (
                <div className="flex items-center gap-2" key={highlight}>
                  <Check
                    className="size-4 text-emerald-500"
                    aria-hidden="true"
                  />
                  {highlight}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-4xl overflow-hidden rounded-lg border bg-zinc-950 text-zinc-100 shadow-2xl shadow-sky-950/20">
            <div className="flex items-center justify-between border-zinc-800 border-b px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <ShieldCheck
                  className="size-4 text-emerald-400"
                  aria-hidden="true"
                />
                signed-upload.ts
              </div>
              <span className="text-xs text-zinc-500">S3 + ImageKit</span>
            </div>
            <pre className="overflow-x-auto p-5 text-[13px] leading-6">
              <code>{`import { awsS3, createUploader } from "@marinedotsh/upload-sdk";

const uploader = createUploader({
  storageProfiles,
  defaultStorageProfile: "s3",
  assets: {
    avatar: {
      keyPrefix: "uploads/avatars",
      accept: ["image/png", "image/jpeg"],
      limits: {
        maxFileSize: { value: 1, unit: "MB" },
      },
    },
  },
});

const target = await uploader.prepareUpload("avatar", {
  filename: "profile.png",
  contentType: "image/png",
  size: 120_000,
});`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-12 md:grid-cols-3 md:px-8">
        <div className="rounded-lg border bg-fd-card p-5">
          <h2 className="text-base font-semibold">Sign once</h2>
          <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
            Prepare browser upload targets from server-side profiles without
            leaking provider credentials.
          </p>
        </div>
        <div className="rounded-lg border bg-fd-card p-5">
          <h2 className="text-base font-semibold">Validate early</h2>
          <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
            Enforce size, MIME type, duration, and key-prefix rules before a
            provider signature is created.
          </p>
        </div>
        <div className="rounded-lg border bg-fd-card p-5">
          <h2 className="text-base font-semibold">Swap providers</h2>
          <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
            Keep application upload flows stable while S3 and ImageKit details
            stay behind profiles.
          </p>
        </div>
      </section>

      <section className="border-t px-6 py-10 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Install Upload SDK</h2>
            <p className="mt-1 text-sm text-fd-muted-foreground">
              Published as @marinedotsh/upload-sdk.
            </p>
          </div>
          <div className="grid gap-2 md:min-w-[24rem]">
            {installCommands.map((command) => (
              <code
                className="rounded-md border bg-fd-muted px-3 py-2 text-sm text-fd-muted-foreground"
                key={command}
              >
                {command}
              </code>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
