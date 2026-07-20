import { toUploadSDKError } from "../error"
import type { Duration, DurationUnit } from "../types"
import { durationSchema } from "./zod-schema"

const DURATION_UNIT_SECONDS: Record<DurationUnit, number> = {
  seconds: 1,
  minutes: 60,
  hours: 60 * 60,
}

export function resolveDurationSeconds(duration: Duration | undefined): number | undefined {
  if (!duration) {
    return undefined
  }

  let parsedDuration: Duration

  try {
    parsedDuration = durationSchema.parse(duration)
  } catch (error) {
    throw toUploadSDKError(error, {
      code: "INVALID_UPLOAD_CONFIG",
      message: "Upload expiration duration is invalid.",
    })
  }

  return parsedDuration.value * DURATION_UNIT_SECONDS[parsedDuration.unit]
}
