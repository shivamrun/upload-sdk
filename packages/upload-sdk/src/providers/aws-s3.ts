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

type PostPolicyCondition = Record<string, string> | ["content-length-range", number, number]

export function awsS3(config: AwsS3Config): StorageProvider {
  async function prepareUpload(input: ProviderPrepareUploadInput): Promise<PrepareUploadOutput> {
    const expiresInSeconds = input.expiresInSeconds ?? 300

    if (!Number.isInteger(expiresInSeconds) || expiresInSeconds < 1 || expiresInSeconds > 604_800) {
      throw new Error("expiresInSeconds must be between 1 and 604800 seconds")
    }

    const key = input.key.replace(/^\/+/, "")

    if (!key) {
      throw new Error("Upload key cannot be empty")
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000)
    const amzDate = formatAmzDate(now)
    const dateStamp = amzDate.slice(0, 8)
    const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`
    const credential = `${config.credentials.accessKeyId}/${credentialScope}`

    const metadataFields = Object.fromEntries(
      Object.entries(input.metadata ?? {}).map(([name, value]) => [
        `x-amz-meta-${name.toLowerCase()}`,
        String(value),
      ]),
    )

    const fields: Record<string, string> = {
      key,
      "Content-Type": input.contentType,
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": credential,
      "X-Amz-Date": amzDate,
      ...metadataFields,
    }

    if (config.credentials.sessionToken) {
      fields["X-Amz-Security-Token"] = config.credentials.sessionToken
    }

    const conditions: PostPolicyCondition[] = [
      { bucket: config.bucket },
      { key },
      { "Content-Type": input.contentType },
      { "X-Amz-Algorithm": fields["X-Amz-Algorithm"] },
      { "X-Amz-Credential": fields["X-Amz-Credential"] },
      { "X-Amz-Date": fields["X-Amz-Date"] },
      ...Object.entries(metadataFields).map(
        ([name, value]) => ({ [name]: value }) as Record<string, string>,
      ),
    ]

    if (config.credentials.sessionToken) {
      conditions.push({
        "X-Amz-Security-Token": config.credentials.sessionToken,
      })
    }

    if (input.limits?.maxFileSizeBytes) {
      conditions.push(["content-length-range", 0, input.limits.maxFileSizeBytes])
    }

    const policy = {
      expiration: expiresAt.toISOString(),
      conditions,
    }

    const encodedPolicy = encodeBase64(JSON.stringify(policy))
    const signature = await createSignature(
      config.credentials.secretAccessKey,
      dateStamp,
      config.region,
      encodedPolicy,
    )

    fields.Policy = encodedPolicy
    fields["X-Amz-Signature"] = signature

    return {
      strategy: "multipart",
      url: `https://${config.bucket}.s3.${config.region}.amazonaws.com`,
      method: "POST",
      headers: {},
      fields,
      key,
      expiresAt: expiresAt.toISOString(),
    }
  }

  return {
    prepareUpload,
  }
}

function formatAmzDate(date: Date): string {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "")
}

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

function encodeBase64(value: string): string {
  return encodeBase64Bytes(new TextEncoder().encode(value))
}

function encodeBase64Bytes(bytes: Uint8Array): string {
  let output = ""

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index]
    const second = bytes[index + 1]
    const third = bytes[index + 2]

    output += BASE64_ALPHABET[first >> 2]
    output += BASE64_ALPHABET[((first & 0b00000011) << 4) | ((second ?? 0) >> 4)]
    output +=
      second === undefined
        ? "="
        : BASE64_ALPHABET[((second & 0b00001111) << 2) | ((third ?? 0) >> 6)]
    output += third === undefined ? "=" : BASE64_ALPHABET[third & 0b00111111]
  }

  return output
}
async function createSignature(
  secretAccessKey: string,
  dateStamp: string,
  region: string,
  encodedPolicy: string,
): Promise<string> {
  const dateKey = await hmac(`AWS4${secretAccessKey}`, dateStamp)
  const regionKey = await hmac(dateKey, region)
  const serviceKey = await hmac(regionKey, "s3")
  const signingKey = await hmac(serviceKey, "aws4_request")
  const signature = await hmac(signingKey, encodedPolicy)

  return toHex(signature)
}

async function hmac(key: string | ArrayBuffer, value: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key === "string" ? new TextEncoder().encode(key) : key,
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  )

  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(value))
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}
