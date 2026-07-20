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

  const parsedLimit = fileSizeLimitSchema.parse(limit)

  return parsedLimit.value * FILE_SIZE_UNIT_BYTES[parsedLimit.unit]
}
