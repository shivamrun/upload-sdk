import { toUploadSDKError } from "../error"
import type { FileSizeLimit, FileSizeUnit } from "../types"
import { fileSizeLimitSchema } from "./zod-schema"

const FILE_SIZE_UNIT_BYTES: Record<FileSizeUnit, number> = {
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
}

export function resolveFileSizeLimitBytes(limit: FileSizeLimit | undefined): number | undefined {
  if (!limit) {
    return undefined
  }

  let parsedLimit: FileSizeLimit

  try {
    parsedLimit = fileSizeLimitSchema.parse(limit)
  } catch (error) {
    throw toUploadSDKError(error, {
      code: "INVALID_UPLOAD_CONFIG",
      message: "Maximum file size limit is invalid.",
    })
  }

  return parsedLimit.value * FILE_SIZE_UNIT_BYTES[parsedLimit.unit]
}
