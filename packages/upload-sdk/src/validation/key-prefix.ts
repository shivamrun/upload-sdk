import { toUploadSDKError, UploadSDKError } from "../error"
import { keyPrefixSegmentSchema } from "./zod-schema"

export function sanitizeKeyPrefix(keyPrefix: string): string {
  try {
    if (keyPrefix.includes("\\") || /%2e/i.test(keyPrefix)) {
      throw new UploadSDKError("Key prefix contains invalid path characters", {
        code: "INVALID_UPLOAD_CONFIG",
      })
    }

    const normalizedKeyPrefix = keyPrefix
      .trim()
      .replace(/\/+/g, "/")
      .replace(/^\/|\/$/g, "")

    if (!normalizedKeyPrefix) {
      throw new UploadSDKError("Key prefix cannot be empty", {
        code: "INVALID_UPLOAD_CONFIG",
      })
    }

    const segments = normalizedKeyPrefix.split("/")

    if (segments.some((segment) => segment === "." || segment === "..")) {
      throw new UploadSDKError("Key prefix cannot contain relative path segments", {
        code: "INVALID_UPLOAD_CONFIG",
      })
    }

    return segments.map((segment) => keyPrefixSegmentSchema.parse(segment)).join("/")
  } catch (error) {
    throw toUploadSDKError(error, {
      code: "INVALID_UPLOAD_CONFIG",
      message: "Key prefix is invalid.",
    })
  }
}
