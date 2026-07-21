import {
  ArrowRight,
  Braces,
  Check,
  Cloud,
  CloudUpload,
  Code2,
  FileCheck2,
  GitBranch,
  KeyRound,
  Layers3,
  LockKeyhole,
  Package,
  Route,
  Server,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: Layers3,
    title: "Typed assets",
    description:
      "Represent avatars, documents, banners, and other uploads as named, strongly typed configurations.",
  },
  {
    icon: Route,
    title: "Storage profiles",
    description:
      "Route assets through named AWS S3 or ImageKit profiles without leaking provider details into product code.",
  },
  {
    icon: FileCheck2,
    title: "Validation first",
    description:
      "Validate filename, key prefix, MIME type, extension, size, and expiration before generating upload credentials.",
  },
  {
    icon: LockKeyhole,
    title: "Server-side signing",
    description:
      "Keep provider credentials inside server-side factories and return only short-lived upload fields.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Configure providers",
    description:
      "Create named storage profiles using AWS S3 or ImageKit credentials.",
  },
  {
    number: "02",
    title: "Define assets",
    description:
      "Describe file rules, limits, metadata, storage profile, and key prefix.",
  },
  {
    number: "03",
    title: "Prepare",
    description: "Send file metadata to your server and call prepareUpload.",
  },
  {
    number: "04",
    title: "Upload",
    description:
      "Submit the returned fields and file directly to the provider.",
  },
];

const providers = [
  {
    name: "AWS S3",
    subtitle: "Signature V4 POST policy",
    icon: "S3",
    description:
      "Generate signed multipart POST fields with constrained object keys, content type, metadata, expiration, and optional file-size limits.",
    details: [
      ["Strategy", "Multipart POST"],
      ["Authentication", "AWS SigV4"],
      ["Expiry", "Up to 7 days"],
    ],
  },
  {
    name: "ImageKit",
    subtitle: "V2 upload JWT",
    icon: "IK",
    description:
      "Generate short-lived upload JWTs with destination fields, overwrite protection, metadata, and optional MIME checks.",
    details: [
      ["Strategy", "Multipart POST"],
      ["Authentication", "HS256 JWT"],
      ["Overwrite", "Disabled"],
    ],
  },
];

const sdkHandles = [
  "Asset and storage-profile resolution",
  "Filename and key-prefix sanitization",
  "MIME, extension, and file-size validation",
  "Provider-specific upload signing",
  "Typed preparation results and SDK errors",
];

const applicationHandles = [
  "Authentication and authorization",
  "API routes or server actions",
  "Submitting FormData from the browser",
  "Upload completion and persistence",
  "Retries, cleanup, and rate limiting",
];

const setupCode = `import {
  createUploader,
  defineAssets,
  defineStorageProfiles,
} from "@marinedotsh/upload-sdk";
import { awsS3 } from "@marinedotsh/upload-sdk/providers";

const storageProfiles = defineStorageProfiles({
  media: awsS3({
    bucket: process.env.AWS_BUCKET!,
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  }),
});

const assets = defineAssets(storageProfiles, {
  avatar: {
    storageProfile: "media",
    keyPrefix: "uploads/avatars",
    expiresIn: { value: 5, unit: "minutes" },
    accept: {
      mimeTypes: ["image/png", "image/jpeg"],
      extensions: [".png", ".jpg", ".jpeg"],
    },
    limits: {
      maxFileSize: { value: 1, unit: "MB" },
    },
  },
});

export const uploader = createUploader({
  storageProfiles,
  defaultStorageProfile: "media",
  assets,
});`;

const uploadCode = `const prepared = await uploader.prepareUpload("avatar", {
  filename: "profile.png",
  contentType: "image/png",
  size: 120_000,
});

const formData = new FormData();

for (const [name, value] of Object.entries(prepared.fields)) {
  formData.append(name, value);
}

formData.append("file", file);

await fetch(prepared.url, {
  method: prepared.method,
  headers: prepared.headers,
  body: formData,
});`;

export default function HomePage() {
  return (
    <main className="flex-1 overflow-hidden bg-fd-background text-fd-foreground">
      <Hero />
      <ValueStrip />
      <BenefitsSection />
      <WorkflowSection />
      <CodeSection />
      <ProvidersSection />
      <BoundariesSection />
      <FinalCTA />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative border-b">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_50%_0%,var(--color-fd-primary)/0.12,transparent_60%)]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-fd-background/80 px-3 py-1.5 text-sm text-fd-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="size-3.5 text-fd-primary" aria-hidden="true" />
            TypeScript-first upload infrastructure
          </div>

          <h1 className="mt-7 text-5xl font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl">
            Direct uploads without provider-specific application code.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-fd-muted-foreground">
            Define typed assets, validate file information, and prepare secure
            upload targets for AWS S3 and ImageKit through one focused API.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/docs"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-fd-primary px-5 text-sm font-medium text-fd-primary-foreground transition hover:bg-fd-primary/90"
            >
              Get started
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>

            <Link
              href="/docs/getting-started/quick-start"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-fd-background px-5 text-sm font-medium transition hover:bg-fd-accent"
            >
              <Code2 className="size-4" aria-hidden="true" />
              View quick start
            </Link>
          </div>

          <div className="mt-9 grid max-w-xl gap-3 text-sm text-fd-muted-foreground sm:grid-cols-2">
            {[
              "Typed configuration",
              "Server-side signing",
              "Validation before signing",
              "Direct browser uploads",
            ].map((item) => (
              <div className="flex items-center gap-2" key={item}>
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                  <Check
                    className="size-3 text-emerald-500"
                    aria-hidden="true"
                  />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <UploadFlowPreview />
      </div>
    </section>
  );
}

function UploadFlowPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div
        className="absolute -inset-8 rounded-full bg-fd-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-2xl border bg-fd-card shadow-2xl shadow-black/10">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CloudUpload className="size-4 text-fd-primary" />
            Upload flow
          </div>

          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Secure
          </span>
        </div>

        <div className="space-y-4 p-5">
          <FlowStep
            icon={<Upload className="size-4" />}
            title="Browser"
            description="Sends filename, content type, and file size"
            active
          />

          <FlowConnector label="File metadata" />

          <FlowStep
            icon={<Server className="size-4" />}
            title="Application server"
            description="Authenticates the request and calls the SDK"
          />

          <FlowConnector label="prepareUpload()" />

          <FlowStep
            icon={<Braces className="size-4" />}
            title="Upload SDK"
            description="Validates, resolves the profile, and signs"
            highlighted
          />

          <FlowConnector label="Signed fields" />

          <FlowStep
            icon={<Cloud className="size-4" />}
            title="Storage provider"
            description="Receives the file directly from the browser"
          />
        </div>

        <div className="grid grid-cols-3 border-t bg-fd-muted/30">
          <FlowMetric label="Method" value="POST" />
          <FlowMetric label="Body" value="FormData" bordered />
          <FlowMetric label="Strategy" value="multipart" bordered />
        </div>
      </div>
    </div>
  );
}

function FlowStep({
  icon,
  title,
  description,
  active = false,
  highlighted = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active?: boolean;
  highlighted?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-start gap-4 rounded-xl border p-4",
        highlighted
          ? "border-fd-primary/30 bg-fd-primary/5"
          : "bg-fd-background",
      ].join(" ")}
    >
      <div
        className={[
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          highlighted
            ? "bg-fd-primary text-fd-primary-foreground"
            : active
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-fd-muted text-fd-muted-foreground",
        ].join(" ")}
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs leading-5 text-fd-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function FlowConnector({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-4">
      <div className="ml-[1.08rem] h-5 border-l" />
      <span className="font-mono text-[10px] uppercase tracking-wider text-fd-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function FlowMetric({
  label,
  value,
  bordered = false,
}: {
  label: string;
  value: string;
  bordered?: boolean;
}) {
  return (
    <div className={`px-4 py-4 ${bordered ? "border-l" : ""}`}>
      <p className="text-[10px] uppercase tracking-wider text-fd-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-xs font-medium">{value}</p>
    </div>
  );
}

function ValueStrip() {
  return (
    <section className="border-b bg-fd-muted/20">
      <div className="mx-auto grid max-w-7xl divide-y px-6 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:px-8">
        <ValueItem
          value="2"
          label="Providers"
          description="AWS S3 and ImageKit"
        />
        <ValueItem
          value="1"
          label="Upload strategy"
          description="Multipart POST"
        />
        <ValueItem
          value="0"
          label="Client secrets"
          description="Credentials remain server-side"
        />
        <ValueItem
          value="100%"
          label="Typed configuration"
          description="Assets and profiles are inferred"
        />
      </div>
    </section>
  );
}

function ValueItem({
  value,
  label,
  description,
}: {
  value: string;
  label: string;
  description: string;
}) {
  return (
    <div className="py-7 sm:px-6 first:pl-0 last:pr-0">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs text-fd-muted-foreground">{description}</p>
    </div>
  );
}

function BenefitsSection() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionIntro
          eyebrow="Why Upload SDK"
          title="A clean boundary between product logic and provider APIs."
          description="Your application describes upload intent. The SDK handles shared validation and provider-specific signing."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <article
                className={[
                  "group relative overflow-hidden rounded-2xl border bg-fd-card p-7 transition hover:-translate-y-0.5 hover:shadow-lg",
                  index === 0 || index === 3 ? "md:min-h-72" : "",
                ].join(" ")}
                key={benefit.title}
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl border bg-fd-background">
                    <Icon className="size-5 text-fd-primary" />
                  </div>

                  <span className="font-mono text-xs text-fd-muted-foreground">
                    0{index + 1}
                  </span>
                </div>

                <div className="mt-10 max-w-xl">
                  <h3 className="text-xl font-semibold">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-fd-muted-foreground">
                    {benefit.description}
                  </p>
                </div>

                <div
                  className="pointer-events-none absolute -bottom-16 -right-12 size-44 rounded-full bg-fd-primary/5 blur-3xl"
                  aria-hidden="true"
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className="border-b bg-fd-muted/20">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionIntro
          eyebrow="How it works"
          title="A predictable four-step upload flow."
          description="The server prepares the upload. The browser transfers the actual file directly to the provider."
        />

        <div className="relative mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div
            className="absolute top-6 right-[12.5%] left-[12.5%] hidden border-t border-dashed lg:block"
            aria-hidden="true"
          />

          {workflow.map((step) => (
            <article className="relative" key={step.number}>
              <span className="relative z-10 inline-flex size-12 items-center justify-center rounded-full border bg-fd-background font-mono text-xs font-semibold text-fd-primary shadow-sm">
                {step.number}
              </span>

              <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CodeSection() {
  return (
    <section className="border-b">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-fd-primary">
            Developer experience
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Configuration that reads like product policy.
          </h2>

          <p className="mt-4 leading-7 text-fd-muted-foreground">
            Profiles contain provider configuration. Assets describe what your
            application accepts. The uploader connects them at runtime.
          </p>

          <div className="mt-8 space-y-4">
            <CodeBenefit text="Literal asset-name inference" />
            <CodeBenefit text="Typed storage-profile references" />
            <CodeBenefit text="Runtime validation before signing" />
            <CodeBenefit text="Provider-independent preparation output" />
          </div>

          <Link
            href="/docs/getting-started/quick-start"
            className="group mt-9 inline-flex items-center gap-2 text-sm font-medium text-fd-primary"
          >
            Read the quick-start guide
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-zinc-950 shadow-xl">
          <CodeHeader filename="upload.server.ts" label="Server" />

          <pre className="max-h-[42rem] overflow-auto p-6 font-mono text-[12px] leading-6 text-zinc-300 sm:text-[13px]">
            <code>{setupCode}</code>
          </pre>

          <div className="grid grid-cols-3 border-zinc-800 border-t bg-zinc-900/70">
            <CodeMetric label="Asset" value="avatar" />
            <CodeMetric label="Profile" value="media" bordered />
            <CodeMetric label="Provider" value="AWS S3" bordered />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="overflow-hidden rounded-2xl border bg-zinc-950">
          <CodeHeader filename="upload-file.ts" label="Browser" />

          <div className="grid lg:grid-cols-[1fr_20rem]">
            <pre className="overflow-auto p-6 font-mono text-[12px] leading-6 text-zinc-300 sm:text-[13px] lg:border-zinc-800 lg:border-r">
              <code>{uploadCode}</code>
            </pre>

            <div className="p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Prepared result
              </p>

              <dl className="mt-8 space-y-6">
                <DarkDefinition term="strategy" value='"multipart"' />
                <DarkDefinition term="method" value='"POST"' />
                <DarkDefinition term="fields" value="Record<string, string>" />
                <DarkDefinition term="expiresAt" value="ISO timestamp" />
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CodeBenefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10">
        <Check className="size-3.5 text-emerald-500" />
      </span>
      {text}
    </div>
  );
}

function ProvidersSection() {
  return (
    <section className="border-b bg-fd-muted/20">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionIntro
            eyebrow="Providers"
            title="One shared contract, provider-specific signing."
            description="The application-facing preparation flow remains stable while each provider generates the fields it requires."
          />

          <Link
            href="/docs/providers/aws-s3"
            className="group inline-flex items-center gap-2 text-sm font-medium text-fd-primary"
          >
            View provider documentation
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {providers.map((provider) => (
            <ProviderCard key={provider.name} provider={provider} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProviderCard({ provider }: { provider: (typeof providers)[number] }) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-fd-background">
      <div className="flex items-start gap-5 p-7">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-fd-muted font-mono text-sm font-semibold text-fd-primary">
          {provider.icon}
        </span>

        <div>
          <h3 className="text-xl font-semibold">{provider.name}</h3>
          <p className="mt-1 font-mono text-xs text-fd-primary">
            {provider.subtitle}
          </p>
        </div>
      </div>

      <div className="border-t px-7 py-6">
        <p className="text-sm leading-7 text-fd-muted-foreground">
          {provider.description}
        </p>
      </div>

      <dl className="grid grid-cols-3 border-t bg-fd-muted/20">
        {provider.details.map(([term, value], index) => (
          <div
            className={`px-4 py-4 ${index > 0 ? "border-l" : ""}`}
            key={term}
          >
            <dt className="text-[10px] uppercase tracking-wider text-fd-muted-foreground">
              {term}
            </dt>
            <dd className="mt-1 font-mono text-xs font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function BoundariesSection() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionIntro
          eyebrow="Clear boundaries"
          title="The SDK prepares uploads. Your application owns the product flow."
          description="Keeping these responsibilities separate prevents the SDK from becoming tightly coupled to your framework, database, or authentication system."
        />

        <div className="mt-12 grid overflow-hidden rounded-2xl border md:grid-cols-2">
          <BoundaryColumn
            icon={<ShieldCheck className="size-5 text-emerald-500" />}
            eyebrow="Upload SDK"
            title="Handled for you"
            items={sdkHandles}
          />

          <BoundaryColumn
            icon={<Code2 className="size-5 text-amber-500" />}
            eyebrow="Your application"
            title="Remains in your control"
            items={applicationHandles}
            bordered
          />
        </div>
      </div>
    </section>
  );
}

function BoundaryColumn({
  icon,
  eyebrow,
  title,
  items,
  bordered = false,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  items: string[];
  bordered?: boolean;
}) {
  return (
    <article
      className={[
        "bg-fd-card p-7 sm:p-9",
        bordered ? "border-t md:border-t-0 md:border-l" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-fd-muted-foreground">
          {eyebrow}
        </span>
      </div>

      <h3 className="mt-7 text-2xl font-semibold">{title}</h3>

      <ul className="mt-7 space-y-4">
        {items.map((item) => (
          <li
            className="flex items-start gap-3 text-sm text-fd-muted-foreground"
            key={item}
          >
            <Check className="mt-0.5 size-4 shrink-0 text-fd-primary" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function FinalCTA() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border bg-fd-card px-7 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_center,var(--color-fd-primary)/0.14,transparent_65%)]"
            aria-hidden="true"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <Package className="size-7 text-fd-primary" />

              <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
                Prepare your first direct upload.
              </h2>

              <p className="mt-4 leading-7 text-fd-muted-foreground">
                Install the SDK, configure a storage profile, and define your
                first typed upload asset.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/docs/getting-started/quick-start"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-fd-primary px-5 text-sm font-medium text-fd-primary-foreground transition hover:bg-fd-primary/90"
                >
                  Start building
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  href="https://github.com/marinedotsh/upload-sdk"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-fd-background px-5 text-sm font-medium transition hover:bg-fd-accent"
                >
                  <GitBranch className="size-4" />
                  GitHub
                </Link>
              </div>
            </div>

            <div className="min-w-0 rounded-xl border bg-fd-background p-4 sm:min-w-[24rem]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-fd-muted-foreground">
                  Terminal
                </span>
                <KeyRound className="size-3.5 text-fd-muted-foreground" />
              </div>

              <code className="mt-4 block overflow-x-auto whitespace-nowrap font-mono text-sm">
                <span className="mr-3 text-fd-primary">$</span>
                pnpm add @marinedotsh/upload-sdk
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
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
      <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-fd-primary">
        {eyebrow}
      </p>

      <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 max-w-2xl leading-7 text-fd-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function CodeHeader({ filename, label }: { filename: string; label: string }) {
  return (
    <div className="flex items-center justify-between border-zinc-800 border-b px-5 py-4">
      <span className="flex items-center gap-2 font-mono text-xs text-zinc-400">
        <Code2 className="size-3.5" />
        {filename}
      </span>

      <span className="rounded-full border border-zinc-800 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </span>
    </div>
  );
}

function CodeMetric({
  label,
  value,
  bordered = false,
}: {
  label: string;
  value: string;
  bordered?: boolean;
}) {
  return (
    <div className={`px-4 py-4 ${bordered ? "border-zinc-800 border-l" : ""}`}>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1 font-mono text-xs text-zinc-300">{value}</p>
    </div>
  );
}

function DarkDefinition({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
        {term}
      </dt>
      <dd className="mt-2 font-mono text-xs text-zinc-300">{value}</dd>
    </div>
  );
}
