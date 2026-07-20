import { toUploadSDKError, UploadSDKError } from "../error"
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
  let contentType: string

  try {
    contentType = contentTypeSchema.parse(options.contentType)
  } catch (error) {
    throw toUploadSDKError(error, {
      code: "INVALID_UPLOAD_INPUT",
      message: "Content type is invalid.",
    })
  }

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
    parseAcceptedContentType(acceptedContentType),
  )

  if (
    !normalizedAcceptedContentTypes.some((acceptedContentType) =>
      matchesAcceptedContentType(acceptedContentType, contentType),
    )
  ) {
    throw new UploadSDKError(`Content type "${contentType}" is not allowed`, {
      code: "INVALID_UPLOAD_INPUT",
    })
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
    throw new UploadSDKError("File extension is required", {
      code: "INVALID_UPLOAD_INPUT",
    })
  }

  const normalizedAcceptedExtensions = acceptedExtensions.map((extension) =>
    parseAcceptedExtension(extension),
  )

  if (!normalizedAcceptedExtensions.includes(fileExtension)) {
    throw new UploadSDKError(`File extension ".${fileExtension}" is not allowed`, {
      code: "INVALID_UPLOAD_INPUT",
    })
  }
}

function validateFileSize(maxFileSizeBytes: number | undefined, size: number) {
  let fileSize: number

  try {
    fileSize = fileSizeSchema.parse(size)
  } catch (error) {
    throw toUploadSDKError(error, {
      code: "INVALID_UPLOAD_INPUT",
      message: "File size is invalid.",
    })
  }

  if (maxFileSizeBytes === undefined) {
    return
  }

  let maxFileSize: number

  try {
    maxFileSize = maxFileSizeBytesSchema.parse(maxFileSizeBytes)
  } catch (error) {
    throw toUploadSDKError(error, {
      code: "INVALID_UPLOAD_CONFIG",
      message: "Maximum file size limit is invalid.",
    })
  }

  if (fileSize > maxFileSize) {
    throw new UploadSDKError(`File size ${fileSize} exceeds maximum size ${maxFileSize}`, {
      code: "INVALID_UPLOAD_INPUT",
    })
  }
}

function parseAcceptedContentType(acceptedContentType: string): string {
  try {
    return acceptedContentTypeSchema.parse(acceptedContentType)
  } catch (error) {
    throw toUploadSDKError(error, {
      code: "INVALID_UPLOAD_CONFIG",
      message: "Accepted content type is invalid.",
    })
  }
}

function parseAcceptedExtension(extension: string): string {
  try {
    return acceptedExtensionSchema.parse(extension)
  } catch (error) {
    throw toUploadSDKError(error, {
      code: "INVALID_UPLOAD_CONFIG",
      message: "Accepted file extension is invalid.",
    })
  }
}
