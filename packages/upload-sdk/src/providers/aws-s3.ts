import { UploadSDKError } from "../error"
import type { PrepareUploadOutput, ProviderPrepareUploadInput, StorageProvider } from "./../types"
import { encodeBase64, hmacSha256, toHex } from "./../validation/crypto-utils"

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
      throw new UploadSDKError("expiresInSeconds must be between 1 and 604800 seconds", {
        code: "INVALID_UPLOAD_CONFIG",
      })
    }

    const key = input.key.replace(/^\/+/, "")

    if (!key) {
      throw new UploadSDKError("Upload key cannot be empty", {
        code: "INVALID_UPLOAD_CONFIG",
      })
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

async function createSignature(
  secretAccessKey: string,
  dateStamp: string,
  region: string,
  encodedPolicy: string,
): Promise<string> {
  const dateKey = await hmacSha256(`AWS4${secretAccessKey}`, dateStamp)
  const regionKey = await hmacSha256(dateKey, region)
  const serviceKey = await hmacSha256(regionKey, "s3")
  const signingKey = await hmacSha256(serviceKey, "aws4_request")
  const signature = await hmacSha256(signingKey, encodedPolicy)

  return toHex(signature)
}
