import { AwsClient } from "aws4fetch"

import type { PrepareUploadOutput, ProviderPrepareUploadInput, StorageProvider } from "./../types"

export type AwsS3Config = {
  bucket: string
  region: string

  credentials: {
    accessKeyId: string
    secretAccessKey: string
    sessionToken?: string
  }
}

export function awsS3(config: AwsS3Config): StorageProvider {
  const client = new AwsClient({
    accessKeyId: config.credentials.accessKeyId,
    secretAccessKey: config.credentials.secretAccessKey,
    sessionToken: config.credentials.sessionToken,
    service: "s3",
    region: config.region,
  })

  async function prepareUpload(input: ProviderPrepareUploadInput): Promise<PrepareUploadOutput> {
    const expiresInSeconds = input.expiresInSeconds ?? 300

    if (!Number.isInteger(expiresInSeconds) || expiresInSeconds < 1 || expiresInSeconds > 604_800) {
      throw new Error("expiresInSeconds must be between 1 and 604800 seconds")
    }

    const key = input.key.replace(/^\/+/, "")

    if (!key) {
      throw new Error("Upload key cannot be empty")
    }

    const url = new URL(`https://${config.bucket}.s3.${config.region}.amazonaws.com`)

    url.pathname = `/${key}`
    url.searchParams.set("X-Amz-Expires", String(expiresInSeconds))

    const headers = new Headers({
      "Content-Type": input.contentType,
    })

    for (const [name, value] of Object.entries(input.metadata ?? {})) {
      headers.set(`x-amz-meta-${name.toLowerCase()}`, String(value))
    }

    const request = await client.sign(url, {
      method: "PUT",
      headers,

      aws: {
        signQuery: true,
        allHeaders: true,
      },
    })

    return {
      strategy: "raw",
      url: request.url,
      method: "PUT",
      headers: Object.fromEntries(request.headers.entries()),
      key,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    }
  }

  return {
    prepareUpload,
  }
}
