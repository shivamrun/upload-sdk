import {
  ArrowRight,
  Check,
  CloudUpload,
  Database,
  FileCheck2,
  KeyRound,
  LockKeyhole,
  Route,
  Server,
  ShieldCheck,
  Upload,
} from "lucide-react";
import Link from "next/link";

const quickPaths = [
  {
    title: "Next.js direct uploads",
    description: "Route-handler signing flow with browser FormData uploads.",
    href: "/docs/guides/next-js-direct-uploads",
    label: "App Router",
    icon: Route,
  },
  {
    title: "S3 presigned POST uploads",
    description: "Signed POST fields, CORS, size limits, and object keys.",
    href: "/docs/guides/s3-presigned-browser-uploads",
    label: "AWS S3",
    icon: CloudUpload,
  },
  {
    title: "ImageKit browser uploads",
    description: "Signed upload tokens, checks, metadata, and overwrite rules.",
    href: "/docs/guides/imagekit-browser-uploads",
    label: "ImageKit",
    icon: KeyRound,
  },
  {
    title: "File upload validation",
    description:
      "What the SDK checks before signing and what still needs trust.",
    href: "/docs/getting-started/upload-safety",
    label: "Safety",
    icon: FileCheck2,
  },
];

const flowSteps = [
  {
    title: "Browser",
    description: "Reports name, MIME type, and size.",
    detail: "No provider secrets",
    icon: Upload,
  },
  {
    title: "Server",
    description: "Authenticates and calls prepareUpload().",
    detail: "Credentials stay here",
    icon: Server,
  },
  {
    title: "Provider",
    description: "Receives the file through signed multipart fields.",
    detail: "S3 or ImageKit",
    icon: CloudUpload,
  },
];

const sdkBenefits = [
  "Typed assets for product-level upload rules",
  "Server-side provider credentials",
  "Validation before signing",
  "Provider-specific fields behind one preparation result",
];

const appResponsibilities = [
  "Authentication and authorization",
  "Database persistence",
  "Upload completion checks",
  "Cleanup, retries, and file inspection",
];

const providers = [
  {
    provider: "AWS S3",
    href: "/docs/providers/aws-s3",
    signing: "Presigned POST policy",
    browserBody: "multipart FormData",
    constraints: "key, content type, metadata, expiration, optional size limit",
    expiry: "up to 7 days",
  },
  {
    provider: "ImageKit",
    href: "/docs/providers/imagekit",
    signing: "Signed upload token",
    browserBody: "multipart FormData",
    constraints: "filename, folder, overwrite behavior, checks, metadata",
    expiry: "up to 1 hour",
  },
];

const terminalLines = [
  "pnpm add @marinedotsh/upload-sdk",
  "defineStorageProfiles({ media: awsS3(...) })",
  'await uploader.prepareUpload("avatar", fileInfo)',
];

export default function HomePage() {
  return (
    <main className="flex-1 bg-fd-background text-fd-foreground">
      <Hero />
      <QuickPaths />
      <HowItWorks />
      <WhyUseIt />
      <ProviderComparison />
      <FinalCTA />
    </main>
  );
}

function Hero() {
  return (
    <section className="border-b bg-[linear-gradient(180deg,var(--color-fd-muted)/0.28,transparent_55%)]">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1fr_31rem] lg:px-8 lg:py-20">
        <div className="max-w-3xl self-center">
          <div className="inline-flex items-center gap-2 rounded-md border bg-fd-background px-3 py-1.5 text-sm text-fd-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>TypeScript upload SDK</span>
          </div>

          <h1 className="mt-6 text-5xl font-semibold text-balance sm:text-6xl">
            Upload SDK
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-fd-muted-foreground">
            Prepare signed direct uploads for AWS S3 and ImageKit from your
            server, then send files directly from the browser with typed asset
            rules and file upload validation.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/docs/getting-started/quick-start"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-fd-primary px-5 text-sm font-medium text-fd-primary-foreground transition hover:bg-fd-primary/90"
            >
              Quick Start
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/docs/guides/next-js-direct-uploads"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-fd-background px-5 text-sm font-medium transition hover:bg-fd-accent"
            >
              Next.js Direct Uploads
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            <HeroMetric value="S3" label="presigned POST uploads" />
            <HeroMetric value="IK" label="ImageKit browser uploads" />
            <HeroMetric value="TS" label="typed upload validation" />
          </div>
        </div>

        <UploadContractPanel />
      </div>
    </section>
  );
}

function UploadContractPanel() {
  return (
    <aside className="self-center rounded-lg border bg-fd-card shadow-xl shadow-black/5">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="size-4 text-emerald-500" aria-hidden="true" />
          Signed upload contract
        </div>
        <span className="rounded-md border bg-fd-background px-2 py-1 font-mono text-[11px] text-fd-muted-foreground">
          POST
        </span>
      </div>

      <div className="space-y-3 p-4">
        <ContractRow label="asset" value="avatar" />
        <ContractRow label="provider" value="aws-s3 | imagekit" />
        <ContractRow label="accept" value="image/png, image/jpeg" />
        <ContractRow label="maxFileSize" value="1 MB" />
      </div>

      <div className="border-t bg-fd-background/70 p-4">
        <p className="font-mono text-[11px] uppercase text-fd-muted-foreground">
          Prepared response
        </p>
        <div className="mt-3 grid gap-2 text-sm">
          <ResultPill>url</ResultPill>
          <ResultPill>fields</ResultPill>
          <ResultPill>headers</ResultPill>
          <ResultPill>expiresAt</ResultPill>
        </div>
      </div>
    </aside>
  );
}

function QuickPaths() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {quickPaths.map((path) => {
            const Icon = path.icon;

            return (
              <Link
                href={path.href}
                className="group rounded-lg border bg-fd-card p-5 transition hover:border-fd-primary/50 hover:bg-fd-accent/35"
                key={path.title}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-md border bg-fd-background px-2 py-1 font-mono text-[11px] text-fd-muted-foreground">
                    {path.label}
                  </span>
                  <Icon className="size-4 text-fd-primary" aria-hidden="true" />
                </div>
                <h2 className="mt-6 text-base font-semibold">{path.title}</h2>
                <p className="mt-3 text-sm leading-6 text-fd-muted-foreground">
                  {path.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-fd-primary">
                  Read guide
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="border-b bg-fd-muted/20">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionIntro
            eyebrow="How it works"
            title="A short signing path, then a direct browser upload."
            description="Your application owns the request. Upload SDK prepares the provider target. The browser submits the file to S3 or ImageKit."
          />

          <div className="grid gap-3">
            {flowSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  className="grid gap-4 rounded-lg border bg-fd-background p-4 sm:grid-cols-[3rem_1fr_auto] sm:items-center"
                  key={step.title}
                >
                  <div className="flex size-11 items-center justify-center rounded-md bg-fd-primary/10 text-fd-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] text-fd-muted-foreground">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-1 font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <span className="rounded-md border bg-fd-card px-3 py-1.5 text-sm text-fd-muted-foreground">
                    {step.detail}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyUseIt() {
  return (
    <section className="border-b">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 lg:grid-cols-2 lg:px-8">
        <BoundaryPanel
          eyebrow="What the SDK handles"
          title="Signing policy, typed rules, and provider fields."
          icon={<LockKeyhole className="size-5 text-emerald-500" />}
          items={sdkBenefits}
        />
        <BoundaryPanel
          eyebrow="What stays yours"
          title="Application trust, persistence, and product workflow."
          icon={<Database className="size-5 text-amber-500" />}
          items={appResponsibilities}
        />
      </div>
    </section>
  );
}

function ProviderComparison() {
  return (
    <section className="border-b bg-fd-muted/20">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <SectionIntro
            eyebrow="Provider behavior"
            title="One API shape, explicit S3 and ImageKit behavior."
            description="Both providers return a browser-ready multipart upload target, but their signing mechanisms and constraints stay visible."
          />
          <Link
            href="/docs/providers/overview"
            className="inline-flex items-center gap-2 text-sm font-medium text-fd-primary"
          >
            Provider overview
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-9 overflow-hidden rounded-lg border bg-fd-background">
          <div className="grid border-b bg-fd-muted/40 px-4 py-3 font-mono text-[11px] uppercase text-fd-muted-foreground md:grid-cols-[0.8fr_0.9fr_0.9fr_1.5fr_0.7fr]">
            <span>Provider</span>
            <span className="hidden md:block">Signing</span>
            <span className="hidden md:block">Browser body</span>
            <span className="hidden md:block">Signed constraints</span>
            <span className="hidden md:block">Expiry</span>
          </div>

          {providers.map((provider) => (
            <div
              className="grid gap-3 border-b px-4 py-5 text-sm last:border-b-0 md:grid-cols-[0.8fr_0.9fr_0.9fr_1.5fr_0.7fr] md:items-center"
              key={provider.provider}
            >
              <Link
                href={provider.href}
                className="font-medium text-fd-primary hover:underline"
              >
                {provider.provider}
              </Link>
              <MobileField label="Signing" value={provider.signing} />
              <MobileField label="Browser body" value={provider.browserBody} />
              <MobileField label="Constraints" value={provider.constraints} />
              <MobileField label="Expiry" value={provider.expiry} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 rounded-lg border bg-fd-card p-6 lg:grid-cols-[1fr_27rem] lg:items-center lg:p-8">
          <div>
            <p className="font-mono text-xs uppercase text-fd-primary">
              Start building
            </p>
            <h2 className="mt-4 text-3xl font-semibold">
              Build your first direct upload.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-fd-muted-foreground">
              Install the package, configure one storage profile, define one
              upload asset, and return a prepared upload from your server.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/docs/getting-started/quick-start"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-fd-primary px-5 text-sm font-medium text-fd-primary-foreground transition hover:bg-fd-primary/90"
              >
                Quick Start
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/docs/api-reference"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-fd-background px-5 text-sm font-medium transition hover:bg-fd-accent"
              >
                API Reference
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="https://github.com/marinedotsh/upload-sdk"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-fd-background px-5 text-sm font-medium transition hover:bg-fd-accent"
              >
                GitHub
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-zinc-950 p-4 text-zinc-300">
            <div className="flex items-center justify-between border-zinc-800 border-b pb-3">
              <span className="font-mono text-xs text-zinc-500">
                upload.server.ts
              </span>
              <span className="rounded-md border border-zinc-800 px-2 py-1 font-mono text-[10px] text-zinc-500">
                SERVER
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {terminalLines.map((line) => (
                <code
                  className="block overflow-x-auto whitespace-nowrap font-mono text-xs"
                  key={line}
                >
                  <span className="mr-3 text-emerald-400">$</span>
                  {line}
                </code>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border bg-fd-card p-4">
      <p className="font-mono text-lg font-semibold">{value}</p>
      <p className="mt-1 text-xs leading-5 text-fd-muted-foreground">{label}</p>
    </div>
  );
}

function ContractRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 rounded-md border bg-fd-background px-3 py-2 text-sm">
      <span className="font-mono text-[11px] text-fd-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}

function ResultPill({ children }: { children: string }) {
  return (
    <span className="rounded-md border bg-fd-card px-3 py-2 font-mono text-xs">
      prepared.{children}
    </span>
  );
}

function BoundaryPanel({
  eyebrow,
  title,
  icon,
  items,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  return (
    <article className="rounded-lg border bg-fd-card p-6 lg:p-8">
      <div className="flex items-center gap-3">
        {icon}
        <p className="font-mono text-xs uppercase text-fd-muted-foreground">
          {eyebrow}
        </p>
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-balance">{title}</h2>
      <ul className="mt-7 grid gap-3">
        {items.map((item) => (
          <li className="flex gap-3 text-sm leading-6" key={item}>
            <Check
              className="mt-0.5 size-4 shrink-0 text-fd-primary"
              aria-hidden="true"
            />
            <span className="text-fd-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function MobileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase text-fd-muted-foreground md:hidden">
        {label}
      </p>
      <p className="mt-1 text-fd-muted-foreground md:mt-0">{value}</p>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-xs uppercase text-fd-primary">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold text-balance sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl leading-7 text-fd-muted-foreground">
        {description}
      </p>
    </div>
  );
}
