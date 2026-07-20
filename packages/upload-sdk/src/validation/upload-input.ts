import type { AssetUploadConfig } from "../types"
import { resolveFileSizeLimitBytes } from "./file-size"
import {
  acceptedContentTypeSchema,
  acceptedExtensionSchema,
  contentTypeSchema,
  fileSizeSchema,
  maxFileSizeBytesSchema,
} from "./zod-schema"

type ValidateUploadInputOptions = {
  asset: AssetUploadConfig
  contentType: string
  fileExtension: string | null
  size: number
}

export function validateUploadInput(options: ValidateUploadInputOptions): string {
  const contentType = contentTypeSchema.parse(options.contentType)

  validateAcceptedContentType(options.asset.accept?.mimeTypes, contentType)
  validateAcceptedExtension(options.asset.accept?.extensions, options.fileExtension)
  validateFileSize(resolveFileSizeLimitBytes(options.asset.limits?.maxFileSize), options.size)

  return contentType
}

function validateAcceptedContentType(
  acceptedContentTypes: readonly string[] | undefined,
  contentType: string,
) {
  if (!acceptedContentTypes?.length) {
    return
  }

  const normalizedAcceptedContentTypes = acceptedContentTypes.map((acceptedContentType) =>
    acceptedContentTypeSchema.parse(acceptedContentType),
  )

  if (
    !normalizedAcceptedContentTypes.some((acceptedContentType) =>
      matchesAcceptedContentType(acceptedContentType, contentType),
    )
  ) {
    throw new Error(`Content type "${contentType}" is not allowed`)
  }
}

function matchesAcceptedContentType(acceptedContentType: string, contentType: string): boolean {
  if (acceptedContentType === contentType) {
    return true
  }

  if (!acceptedContentType.endsWith("/*")) {
    return false
  }

  return contentType.startsWith(`${acceptedContentType.slice(0, -1)}`)
}

function validateAcceptedExtension(
  acceptedExtensions: readonly string[] | undefined,
  fileExtension: string | null,
) {
  if (!acceptedExtensions?.length) {
    return
  }

  if (!fileExtension) {
    throw new Error("File extension is required")
  }

  const normalizedAcceptedExtensions = acceptedExtensions.map((extension) =>
    acceptedExtensionSchema.parse(extension),
  )

  if (!normalizedAcceptedExtensions.includes(fileExtension)) {
    throw new Error(`File extension ".${fileExtension}" is not allowed`)
  }
}

function validateFileSize(maxFileSizeBytes: number | undefined, size: number) {
  const fileSize = fileSizeSchema.parse(size)

  if (maxFileSizeBytes === undefined) {
    return
  }

  const maxFileSize = maxFileSizeBytesSchema.parse(maxFileSizeBytes)

  if (fileSize > maxFileSize) {
    throw new Error(`File size ${fileSize} exceeds maximum size ${maxFileSize}`)
  }
}
