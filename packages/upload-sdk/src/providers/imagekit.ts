import type { PrepareUploadOutput, ProviderPrepareUploadInput, StorageProvider } from "../types"

export type ImageKitConfig = {
  publicKey: string
  privateKey: string
}

export function imageKit(config: ImageKitConfig): StorageProvider {
  async function prepareUpload(input: ProviderPrepareUploadInput): Promise<PrepareUploadOutput> {
    const expiresInSeconds = input.expiresInSeconds ?? 300

    if (!Number.isInteger(expiresInSeconds) || expiresInSeconds < 1 || expiresInSeconds > 3599) {
      throw new Error("expiresInSeconds must be between 1 and 3599 seconds")
    }

    const key = input.key.replace(/^\/+/, "")

    if (!key) {
      throw new Error("Upload key cannot be empty")
    }

    const expire = Math.floor(Date.now() / 1000) + expiresInSeconds
    const token = crypto.randomUUID()
    const signature = await createSignature(token, expire, config.privateKey)
    const lastSlash = key.lastIndexOf("/")
    const folder = lastSlash === -1 ? "/" : `/${key.slice(0, lastSlash)}`

    // TODO(validation): sanitize/normalize the fileName so the returned key
    // matches ImageKit's stored path when validation is enabled.
    const fileName = lastSlash === -1 ? key : key.slice(lastSlash + 1)

    const fields: Record<string, string> = {
      token,
      signature,
      expire: String(expire),
      publicKey: config.publicKey,
      fileName,
      folder,
      useUniqueFileName: "false",
      overwrite: "false",
    }

    if (input.metadata) {
      fields.customMetadata = JSON.stringify(input.metadata)
    }

    return {
      strategy: "multipart",
      url: "https://upload.imagekit.io/api/v1/files/upload",
      method: "POST",
      headers: {},
      fields,
      key,
      expiresAt: new Date(expire * 1000).toISOString(),
    }
  }

  return {
    prepareUpload,
  }
}

async function createSignature(token: string, expire: number, privateKey: string): Promise<string> {
  const encoder = new TextEncoder()

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(privateKey),
    {
      name: "HMAC",
      hash: "SHA-1",
    },
    false,
    ["sign"],
  )

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${token}${expire}`))

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}
