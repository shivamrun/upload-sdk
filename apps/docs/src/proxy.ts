import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server"

/**
 * Environment variables
 *
 * POSTHOG_PROJECT_API_KEY=phc_xxxxxxxxx
 * POSTHOG_API_HOST=https://us.i.posthog.com
 *
 * The public PostHog names are also accepted:
 * NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_xxxxxxxxx
 * NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
 *
 * EU:
 * POSTHOG_API_HOST=https://eu.i.posthog.com
 */

const POSTHOG_EVENT_NAME = "docs_http_request"
const POSTHOG_TIMEOUT_MS = 3_000

const VISITOR_COOKIE_NAME = "__docs_visitor_id"
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

const MAX_USER_AGENT_LENGTH = 1_024
const MAX_RESPONSE_ERROR_LENGTH = 300

const posthogProjectApiKey = firstNonEmpty(
  process.env.POSTHOG_PROJECT_API_KEY,
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
  process.env.NEXT_PUBLIC_POSTHOG_KEY,
)

const posthogApiHost =
  firstNonEmpty(process.env.POSTHOG_API_HOST, process.env.NEXT_PUBLIC_POSTHOG_HOST) ??
  "https://us.i.posthog.com"

const posthogCaptureUrl = createPostHogCaptureUrl(posthogApiHost)

const crawlerRoutes = new Set(["/llms-full.txt", "/llms.txt", "/robots.txt", "/sitemap.xml"])

const campaignParameters = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const

const crawlerUserAgentPattern =
  /(?:^|[\s/;(+_-])(?:bot|crawler|spider|slurp)(?:$|[\s/;)+_-])|googlebot|google-extended|bingbot|bingpreview|duckduckbot|baiduspider|yandexbot|yandeximages|applebot|applebot-extended|bytespider|petalbot|facebookexternalhit|facebookcatalog|linkedinbot|twitterbot|discordbot|slackbot|telegrambot|whatsapp|gptbot|chatgpt-user|oai-searchbot|claudebot|claude-web|anthropic-ai|perplexitybot|perplexity-user|cohere-ai|cohere-training-data-crawler|ccbot|amazonbot|meta-externalagent|meta-externalfetcher|diffbot|youbot|imagesiftbot|archive\.org_bot|ia_archiver|ahrefsbot|semrushbot|mj12bot|dotbot|rogerbot|screaming frog|uptimerobot|pingdom|statuscake/i

const automationUserAgentPattern =
  /curl|wget|httpie|postmanruntime|insomnia|python-requests|python|requests|httpx|aiohttp|axios|node-fetch|undici|got\/|go-http-client|libwww-perl|okhttp|apache-httpclient|java\/|ruby|php\/|powershell|headlesschrome|headless|playwright|puppeteer|selenium|phantomjs/i

const browserUserAgentPattern =
  /mozilla|chrome|chromium|safari|firefox|edg|edge|opr|opera|crios|fxios|samsungbrowser/i

const assetExtensions = new Set([
  "7z",
  "avif",
  "bmp",
  "br",
  "csv",
  "css",
  "eot",
  "flac",
  "gif",
  "gz",
  "heic",
  "heif",
  "ico",
  "jpeg",
  "jpg",
  "js",
  "json",
  "map",
  "md",
  "mdx",
  "mid",
  "midi",
  "mjs",
  "mov",
  "mp3",
  "mp4",
  "ogg",
  "otf",
  "pdf",
  "png",
  "rar",
  "svg",
  "tar",
  "ttf",
  "txt",
  "wasm",
  "wav",
  "webm",
  "webmanifest",
  "webp",
  "woff",
  "woff2",
  "xls",
  "xlsx",
  "xml",
  "zip",
])

type ClientType = "browser" | "crawler" | "automation" | "unknown"

type CapturedRouteType = "homepage" | "documentation" | "llms_documentation" | "crawler_resource"

type CaptureDecision = {
  clientType: ClientType
  routeType: CapturedRouteType
  userAgent: string
  isDocumentNavigation: boolean
}

type BrowserIdentity = {
  distinctId: string
  isNew: boolean
}

type PostHogPropertyValue = string | number | boolean | null | string[]

type PostHogProperties = Record<string, PostHogPropertyValue>

let hasWarnedMissingConfiguration = false

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const decision = getCaptureDecision(request)

  if (!decision) {
    return NextResponse.next()
  }

  if (!posthogProjectApiKey || !posthogCaptureUrl) {
    warnMissingPostHogConfiguration()
    return NextResponse.next()
  }

  const response = NextResponse.next()

  const browserIdentity =
    decision.clientType === "browser" ? getOrCreateBrowserIdentity(request) : null

  if (browserIdentity?.isNew) {
    response.cookies.set({
      name: VISITOR_COOKIE_NAME,
      value: browserIdentity.distinctId,
      path: "/",
      maxAge: VISITOR_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    })
  }

  event.waitUntil(
    captureHttpLog(request, decision, browserIdentity?.distinctId).catch(logCaptureError),
  )

  return response
}

function getCaptureDecision(request: NextRequest): CaptureDecision | null {
  if (request.method !== "GET") {
    return null
  }

  if (isPrefetchOrInternalNavigation(request)) {
    return null
  }

  const pathname = normalizePathname(request.nextUrl.pathname)
  const userAgent = normalizeUserAgent(request.headers.get("user-agent") ?? "")

  const clientType = classifyClient(userAgent)

  /*
   * Honor browser privacy signals.
   *
   * This does not exclude bots because automated agents commonly send
   * unusual or inherited headers that do not represent a human preference.
   */
  if (clientType === "browser" && hasTrackingOptOutSignal(request)) {
    return null
  }

  if (crawlerRoutes.has(pathname)) {
    return {
      clientType,
      routeType: "crawler_resource",
      userAgent,
      isDocumentNavigation: isDocumentNavigation(request),
    }
  }

  if (hasAssetExtension(pathname)) {
    return null
  }

  const routeType = getCapturedRouteType(pathname)

  if (!routeType) {
    return null
  }

  const documentNavigation = isDocumentNavigation(request)
  const isBotLike = clientType !== "browser"

  /*
   * Browsers are captured only for actual document navigations.
   * Bots and automation clients often omit browser navigation headers,
   * so they are captured based on their client classification.
   */
  if (!documentNavigation && !isBotLike) {
    return null
  }

  return {
    clientType,
    routeType,
    userAgent,
    isDocumentNavigation: documentNavigation,
  }
}

async function captureHttpLog(
  request: NextRequest,
  decision: CaptureDecision,
  browserDistinctId?: string,
) {
  if (!posthogProjectApiKey || !posthogCaptureUrl) {
    return
  }

  const distinctId =
    browserDistinctId ?? (await createAgentDistinctId(decision.clientType, decision.userAgent))

  const properties: PostHogProperties = {
    /*
     * These events should remain personless. They are HTTP traffic logs,
     * not authenticated user records.
     */
    $process_person_profile: false,

    $browser_language: request.headers.get("accept-language") ?? "",

    $current_url: createSafeCurrentUrl(request),

    $host: request.nextUrl.host,
    $pathname: request.nextUrl.pathname,

    $raw_user_agent: decision.userAgent,

    $referrer: sanitizeExternalUrl(request.headers.get("referer")),

    accept: truncate(request.headers.get("accept") ?? "", 500),

    client_type: decision.clientType,

    deployment_environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",

    has_query_parameters: request.nextUrl.searchParams.size > 0,

    is_bot_like: decision.clientType !== "browser",

    is_document_navigation: decision.isDocumentNavigation,

    method: request.method,

    path_depth: getPathDepth(request.nextUrl.pathname),

    route_type: decision.routeType,

    source: "next_proxy",
  }

  const platform = request.headers.get("sec-ch-ua-platform")

  if (platform) {
    properties.browser_platform = truncate(platform, 100)
  }

  const campaignProperties = getCampaignProperties(request)

  for (const [key, value] of Object.entries(campaignProperties)) {
    properties[key] = value
  }

  await postToPostHog({
    api_key: posthogProjectApiKey,
    distinct_id: distinctId,
    event: POSTHOG_EVENT_NAME,
    timestamp: new Date().toISOString(),
    properties,
  })
}

async function postToPostHog(payload: {
  api_key: string
  distinct_id: string
  event: string
  timestamp: string
  properties: PostHogProperties
}) {
  if (!posthogCaptureUrl) {
    return
  }

  const controller = new AbortController()

  const timeout = setTimeout(() => {
    controller.abort()
  }, POSTHOG_TIMEOUT_MS)

  try {
    const response = await fetch(posthogCaptureUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    })

    if (response.ok) {
      return
    }

    const responseBody = truncate(await response.text(), MAX_RESPONSE_ERROR_LENGTH)

    throw new Error(
      `PostHog capture failed with status ${response.status}${
        responseBody ? `: ${responseBody}` : ""
      }`,
    )
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`PostHog capture timed out after ${POSTHOG_TIMEOUT_MS}ms`, { cause: error })
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

function getCapturedRouteType(pathname: string): CapturedRouteType | null {
  if (pathname === "/") {
    return "homepage"
  }

  if (isRouteOrChild(pathname, "/docs")) {
    return "documentation"
  }

  if (isRouteOrChild(pathname, "/llms.mdx/docs")) {
    return "llms_documentation"
  }

  return null
}

function classifyClient(userAgent: string): ClientType {
  if (!userAgent) {
    return "unknown"
  }

  if (crawlerUserAgentPattern.test(userAgent)) {
    return "crawler"
  }

  if (automationUserAgentPattern.test(userAgent)) {
    return "automation"
  }

  if (browserUserAgentPattern.test(userAgent)) {
    return "browser"
  }

  return "unknown"
}

function isDocumentNavigation(request: NextRequest) {
  const fetchDestination = request.headers.get("sec-fetch-dest")?.toLowerCase()

  const fetchMode = request.headers.get("sec-fetch-mode")?.toLowerCase()

  if (fetchDestination === "document") {
    return true
  }

  if (fetchMode === "navigate") {
    return true
  }

  /*
   * Older browsers and HTTP tools may not send Fetch Metadata headers.
   */
  if (!fetchDestination && !fetchMode) {
    const accept = request.headers.get("accept")?.toLowerCase() ?? ""

    return accept.includes("text/html")
  }

  return false
}

function isPrefetchOrInternalNavigation(request: NextRequest) {
  const purpose = request.headers.get("purpose")?.toLowerCase() ?? ""

  const secPurpose = request.headers.get("sec-purpose")?.toLowerCase() ?? ""

  return (
    request.nextUrl.searchParams.has("_rsc") ||
    request.headers.get("rsc") === "1" ||
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("x-middleware-prefetch") === "1" ||
    request.headers.has("next-router-state-tree") ||
    request.headers.has("next-url") ||
    purpose.includes("prefetch") ||
    purpose.includes("prerender") ||
    secPurpose.includes("prefetch") ||
    secPurpose.includes("prerender")
  )
}

function hasTrackingOptOutSignal(request: NextRequest) {
  return request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1"
}

function getOrCreateBrowserIdentity(request: NextRequest): BrowserIdentity {
  const existingId = request.cookies.get(VISITOR_COOKIE_NAME)?.value

  if (existingId && isValidVisitorId(existingId)) {
    return {
      distinctId: existingId,
      isNew: false,
    }
  }

  return {
    distinctId: `docs:${crypto.randomUUID()}`,
    isNew: true,
  }
}

async function createAgentDistinctId(clientType: ClientType, userAgent: string) {
  const fingerprint = ["docs-agent", clientType, userAgent || "unknown-user-agent"].join(":")

  const hash = await sha256(fingerprint)

  /*
   * This identifies an agent/user-agent family, not one unique machine.
   * Do not interpret bot unique-user counts as unique physical crawlers.
   */
  return `agent:${clientType}:${hash.slice(0, 40)}`
}

async function sha256(value: string) {
  const encoded = new TextEncoder().encode(value)

  const digest = await crypto.subtle.digest("SHA-256", encoded)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function getCampaignProperties(request: NextRequest): PostHogProperties {
  const properties: PostHogProperties = {}

  for (const parameter of campaignParameters) {
    const value = request.nextUrl.searchParams.get(parameter)

    if (value) {
      properties[parameter] = truncate(value, 200)
    }
  }

  return properties
}

function createSafeCurrentUrl(request: NextRequest) {
  const url = new URL(request.nextUrl.pathname, request.nextUrl.origin)

  /*
   * Only explicitly approved campaign parameters are retained.
   * Arbitrary query parameters can contain tokens, emails or private data.
   */
  for (const parameter of campaignParameters) {
    const value = request.nextUrl.searchParams.get(parameter)

    if (value) {
      url.searchParams.set(parameter, truncate(value, 200))
    }
  }

  return url.toString()
}

function sanitizeExternalUrl(value: string | null) {
  if (!value) {
    return ""
  }

  try {
    const url = new URL(value)

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return ""
    }

    /*
     * Query parameters and fragments are intentionally removed.
     */
    url.username = ""
    url.password = ""
    url.search = ""
    url.hash = ""

    return url.toString()
  } catch {
    return ""
  }
}

function createPostHogCaptureUrl(host: string): string | null {
  try {
    const url = new URL(host)

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null
    }

    url.username = ""
    url.password = ""
    url.search = ""
    url.hash = ""

    const basePath = url.pathname.replace(/\/+$/, "")

    if (basePath === "" || basePath === "/" || basePath === "/capture") {
      url.pathname = "/i/v0/e/"
      return url.toString()
    }

    if (basePath === "/i/v0/e") {
      url.pathname = "/i/v0/e/"
      return url.toString()
    }

    return null
  } catch {
    return null
  }
}

function hasAssetExtension(pathname: string) {
  const lastSegment = pathname.split("/").filter(Boolean).at(-1) ?? ""

  const dotIndex = lastSegment.lastIndexOf(".")

  if (dotIndex <= 0 || dotIndex === lastSegment.length - 1) {
    return false
  }

  const extension = lastSegment.slice(dotIndex + 1).toLowerCase()

  return assetExtensions.has(extension)
}

function isRouteOrChild(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`)
}

function normalizePathname(pathname: string) {
  if (pathname === "/") {
    return pathname
  }

  return pathname.replace(/\/+$/, "")
}

function normalizeUserAgent(userAgent: string) {
  return truncate(userAgent.trim().replace(/\s+/g, " "), MAX_USER_AGENT_LENGTH)
}

function getPathDepth(pathname: string) {
  return pathname.split("/").filter(Boolean).length
}

function isValidVisitorId(value: string) {
  return /^docs:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function truncate(value: string, maximumLength: number) {
  if (value.length <= maximumLength) {
    return value
  }

  return value.slice(0, maximumLength)
}

function firstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    const normalized = value?.trim()

    if (normalized) {
      return normalized
    }
  }

  return undefined
}

function logCaptureError(error: unknown) {
  if (error instanceof Error) {
    console.warn("PostHog request capture failed:", error.message)
    return
  }

  console.warn("PostHog request capture failed:", error)
}

function warnMissingPostHogConfiguration() {
  /*
   * This is best-effort. Proxy instances should not rely on module globals
   * for application correctness.
   */
  if (hasWarnedMissingConfiguration) {
    return
  }

  hasWarnedMissingConfiguration = true

  if (!posthogProjectApiKey) {
    console.warn(
      "PostHog request capture is disabled: configure POSTHOG_PROJECT_API_KEY or NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN.",
    )
  }

  if (!posthogCaptureUrl) {
    console.warn(
      "PostHog request capture is disabled: POSTHOG_API_HOST must be a PostHog ingestion host or current /i/v0/e/ capture endpoint.",
    )
  }
}

/*
 * Keep the matcher narrow so Proxy is not invoked for unrelated application,
 * API, image or framework requests.
 */
export const config = {
  matcher: [
    "/",
    "/docs/:path*",
    "/llms.mdx/docs/:path*",
    "/llms.txt",
    "/llms-full.txt",
    "/robots.txt",
    "/sitemap.xml",
  ],
}
