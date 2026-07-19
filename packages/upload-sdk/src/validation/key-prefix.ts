import { keyPrefixSegmentSchema } from "./zod-schema"

export function sanitizeKeyPrefix(keyPrefix: string): string {
  if (keyPrefix.includes("\\") || /%2e/i.test(keyPrefix)) {
    throw new Error("Key prefix contains invalid path characters")
  }

  const normalizedKeyPrefix = keyPrefix
    .trim()
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "")

  if (!normalizedKeyPrefix) {
    throw new Error("Key prefix cannot be empty")
  }

  const segments = normalizedKeyPrefix.split("/")

  if (segments.some((segment) => segment === "." || segment === "..")) {
    throw new Error("Key prefix cannot contain relative path segments")
  }

  return segments.map((segment) => keyPrefixSegmentSchema.parse(segment)).join("/")
}
