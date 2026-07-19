import type { PrepareUploadOutput, ProviderPrepareUploadInput, StorageProvider } from "./../types"

export type CloudinaryConfig = {
  cloudName: string
  apiKey: string
  apiSecret: string
}

export function cloudinary(config: CloudinaryConfig): StorageProvider {
  async function prepareUpload(input: ProviderPrepareUploadInput): Promise<PrepareUploadOutput> {
    const timestamp = Math.floor(Date.now() / 1000)
    const key = input.key.replace(/^\/+/, "")

    const expiresInSeconds = input.expiresInSeconds ?? 3600

    if (expiresInSeconds !== 3600) {
      throw new Error("Cloudinary signed uploads expire after 3600 seconds")
    }

    if (!key) {
      throw new Error("Upload key cannot be empty")
    }

    const resourceType = getResourceType(input.contentType)
    const publicId = createPublicId(key, resourceType)

    const params = {
      overwrite: "false",
      public_id: publicId,
      timestamp: String(timestamp),
    }

    // TODO(metadata): map SDK metadata to Cloudinary context or structured
    // metadata once provider-specific metadata typing is designed.
    const signature = await createSignature(params, config.apiSecret)

    return {
      strategy: "multipart",
      url: `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
      method: "POST",
      headers: {},
      fields: {
        ...params,
        api_key: config.apiKey,
        signature,
      },
      key: publicId,
      expiresAt: new Date((timestamp + 3600) * 1000).toISOString(),
    }
  }

  return {
    prepareUpload,
  }
}

function getResourceType(contentType: string): "image" | "video" | "raw" {
  if (contentType.startsWith("image/")) {
    return "image"
  }

  if (contentType.startsWith("video/") || contentType.startsWith("audio/")) {
    return "video"
  }

  return "raw"
}

function createPublicId(key: string, resourceType: "image" | "video" | "raw"): string {
  if (resourceType === "raw") {
    return key
  }

  const lastSlash = key.lastIndexOf("/")
  const lastDot = key.lastIndexOf(".")
  const hasExtension = lastDot > lastSlash + 1

  return hasExtension ? key.slice(0, lastDot) : key
}

async function createSignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const stringToSign = Object.entries(params)
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([key, value]) => `${key}=${value}`)
    .join("&")

  const payload = new TextEncoder().encode(`${stringToSign}${apiSecret}`)
  const digest = await crypto.subtle.digest("SHA-256", payload)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}
