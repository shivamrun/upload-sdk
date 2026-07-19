import {
  extensionSchema,
  filenameSchema,
  MAX_FILENAME_LENGTH,
  type SanitizedFileName,
} from "./zod-schema"

function splitFileName(filename: string): SanitizedFileName {
  const lastDotIndex = filename.lastIndexOf(".")

  if (lastDotIndex <= 0 || lastDotIndex === filename.length - 1) {
    return {
      name: filename,
      extension: null,
    }
  }

  return {
    name: filename.slice(0, lastDotIndex),
    extension: filename.slice(lastDotIndex + 1),
  }
}

export function sanitizeFileName(filename: string): SanitizedFileName {
  const parsedFilename = filenameSchema.parse(filename)
  const { name, extension } = splitFileName(parsedFilename)

  const sanitizedExtension = extension ? extensionSchema.parse(extension).toLowerCase() : null

  const sanitizedName = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")

  if (!sanitizedName) {
    throw new Error("Filename contains no valid characters")
  }

  const extensionLength = sanitizedExtension ? sanitizedExtension.length + 1 : 0

  return {
    name: sanitizedName.slice(0, MAX_FILENAME_LENGTH - extensionLength),
    extension: sanitizedExtension,
  }
}

export function generateFileName(filename: string): string {
  const { name, extension } = sanitizeFileName(filename)
  const suffix = `-${crypto.randomUUID()}`

  const maxNameLength = MAX_FILENAME_LENGTH - suffix.length - (extension ? extension.length + 1 : 0)
  const truncatedName = name.slice(0, maxNameLength)

  return extension ? `${truncatedName}${suffix}.${extension}` : `${truncatedName}${suffix}`
}
