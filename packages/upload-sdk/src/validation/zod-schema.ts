import * as z from "zod"

export const MAX_FILENAME_LENGTH = 255
export const MAX_EXTENSION_LENGTH = 32

export interface SanitizedFileName {
  name: string
  extension: string | null
}

export const filenameSchema = z.string().trim().min(1, "Filename cannot be empty")

export const extensionSchema = z
  .string()
  .max(MAX_EXTENSION_LENGTH, `Extension cannot exceed ${MAX_EXTENSION_LENGTH} characters`)
  .regex(/^[a-zA-Z0-9]+$/, "Extension contains invalid characters")

export const keyPrefixSegmentSchema = z
  .string()
  .min(1, "Key prefix segments cannot be empty")
  .regex(/^[a-zA-Z0-9_-]+$/, "Key prefix contains invalid characters")
