# docs

This is a Next.js application generated with
[Create Fumadocs](https://github.com/fuma-nama/fumadocs).

It is a Next.js app configured for Vercel's Next.js runtime.

Run development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

## PostHog request analytics

The docs app can automatically send server-side request events to PostHog so bot and AI crawler
traffic shows up even when the visitor does not run browser JavaScript.

Add these variables to your local or Vercel environment:

```bash
POSTHOG_PROJECT_API_KEY=phc_...
POSTHOG_API_HOST=https://us.i.posthog.com
```

`NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` are also accepted, which is
useful if the same Vercel project already has browser PostHog variables configured. The older
`NEXT_PUBLIC_POSTHOG_KEY` name is still accepted as a compatibility fallback.

Use `https://eu.i.posthog.com` for EU PostHog projects. `POSTHOG_API_HOST` should be the PostHog
ingestion host, but the full current capture endpoint (`https://us.i.posthog.com/i/v0/e/`) is also
accepted. The app sends `docs_http_request` events with the request path, referrer, method, and
`$raw_user_agent`. It captures crawler-facing routes like `/llms.txt`, `/llms-full.txt`,
`/robots.txt`, and `/sitemap.xml`. Homepage, docs pages, and LLM markdown routes are captured only
for real document navigations or bot/automation-style requests. Static assets, API routes, OG images,
framework internals, Next.js router/RSC prefetches, and non-`GET` requests are skipped.

Client IPs are not read or sent by this capture path.

Make sure the Vercel project deploys the Next.js app/runtime output, not the static `out`
directory. Static output cannot run `src/proxy.ts`.

## Explore

In the project, you can see:

- `lib/source.ts`: Code for content source adapter, [`loader()`](https://fumadocs.dev/docs/headless/source-api) provides the interface to access your content.
- `lib/layout.shared.tsx`: Shared options for layouts, optional but preferred to keep.

| Route                     | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `app/(home)`              | The route group for your landing page and other pages. |
| `app/docs`                | The documentation layout and pages.                    |
| `app/api/search/route.ts` | The Route Handler for search.                          |

### Fumadocs MDX

A `source.config.ts` config file has been included, you can customise different options like frontmatter schema.

Read the [Introduction](https://fumadocs.dev/docs/mdx) for further details.

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Fumadocs](https://fumadocs.dev) - learn about Fumadocs
