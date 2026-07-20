import type { PrepareUploadOutput, ProviderPrepareUploadInput, StorageProvider } from "../types"
import { encodeBase64Url, encodeBase64UrlBytes, hmacSha256 } from "./../validation/crypto-utils"
import { acceptedContentTypeSchema } from "./../validation/zod-schema"

export type ImageKitConfig = {
  publicKey: string
  privateKey: string
}

export function imageKit(config: ImageKitConfig): StorageProvider {
  async function prepareUpload(input: ProviderPrepareUploadInput): Promise<PrepareUploadOutput> {
    const expiresInSeconds = input.expiresInSeconds ?? 300

    if (!Number.isInteger(expiresInSeconds) || expiresInSeconds < 1 || expiresInSeconds > 3600) {
      throw new Error("expiresInSeconds must be between 1 and 3600 seconds")
    }

    const key = input.key.replace(/^\/+/, "")

    if (!key) {
      throw new Error("Upload key cannot be empty")
    }

    const issuedAt = Math.floor(Date.now() / 1000)
    const expiresAt = issuedAt + expiresInSeconds
    const lastSlash = key.lastIndexOf("/")
    const folder = lastSlash === -1 ? "/" : `/${key.slice(0, lastSlash)}`
    const fileName = lastSlash === -1 ? key : key.slice(lastSlash + 1)

    const fields: Record<string, string> = {
      fileName,
      folder,
      useUniqueFileName: "false",
      overwrite: "false",
    }

    const checks = createUploadChecks(input)

    if (checks) {
      fields.checks = checks
    }

    if (input.metadata) {
      fields.customMetadata = JSON.stringify(input.metadata)
    }

    const token = await createJwt(
      {
        ...fields,
        iat: issuedAt,
        exp: expiresAt,
      },
      config,
    )

    return {
      strategy: "multipart",
      url: "https://upload.imagekit.io/api/v2/files/upload",
      method: "POST",
      headers: {},
      fields: {
        ...fields,
        token,
      },
      key,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
    }
  }

  return {
    prepareUpload,
  }
}

type JwtPayload = Record<string, string | number>

function createUploadChecks(input: ProviderPrepareUploadInput): string | undefined {
  const checks = [
    createFileSizeCheck(input.limits?.maxFileSizeBytes),
    createMimeTypeCheck(input.accept?.mimeTypes),
  ].filter((check): check is string => Boolean(check))

  return checks.length ? checks.join(" AND ") : undefined
}

function createFileSizeCheck(maxFileSizeBytes: number | undefined): string | undefined {
  return maxFileSizeBytes ? `"file.size" <= ${maxFileSizeBytes}` : undefined
}

function createMimeTypeCheck(
  acceptedContentTypes: readonly string[] | undefined,
): string | undefined {
  if (!acceptedContentTypes?.length) {
    return undefined
  }

  const normalizedAcceptedContentTypes = acceptedContentTypes.map((acceptedContentType) =>
    acceptedContentTypeSchema.parse(acceptedContentType),
  )
  const exactContentTypes = normalizedAcceptedContentTypes.filter(
    (contentType) => !contentType.endsWith("/*"),
  )
  const wildcardContentTypes = normalizedAcceptedContentTypes.filter((contentType) =>
    contentType.endsWith("/*"),
  )

  const checks = [
    createExactMimeTypeCheck(exactContentTypes),
    ...wildcardContentTypes.map(
      (contentType) => `"file.mime" : ${formatCheckValue(contentType.slice(0, -1))}`,
    ),
  ].filter((check): check is string => Boolean(check))

  return checks.length === 1 ? checks[0] : `(${checks.join(" OR ")})`
}

function createExactMimeTypeCheck(contentTypes: string[]): string | undefined {
  if (contentTypes.length === 0) {
    return undefined
  }

  if (contentTypes.length === 1) {
    return `"file.mime" = ${formatCheckValue(contentTypes[0])}`
  }

  return `"file.mime" IN [${contentTypes.map(formatCheckValue).join(", ")}]`
}

function formatCheckValue(value: string): string {
  return JSON.stringify(value)
}

async function createJwt(payload: JwtPayload, config: ImageKitConfig): Promise<string> {
  const header = {
    alg: "HS256",
    typ: "JWT",
    kid: config.publicKey,
  }

  const encodedHeader = encodeBase64Url(JSON.stringify(header))
  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const signatureInput = `${encodedHeader}.${encodedPayload}`
  const signature = await hmacSha256(config.privateKey, signatureInput)

  return `${signatureInput}.${encodeBase64UrlBytes(new Uint8Array(signature))}`
}
