export type UploadSDKErrorCode =
  | "INVALID_UPLOAD_INPUT"
  | "INVALID_UPLOAD_CONFIG"
  | "UNSUPPORTED_UPLOAD_OPERATION"
  | "UPLOAD_PROVIDER_ERROR"

type UploadSDKErrorOptions = {
  code: UploadSDKErrorCode
  statusCode?: number
  cause?: unknown
  details?: unknown
}

type UploadSDKErrorFallback = {
  code: UploadSDKErrorCode
  message: string
  statusCode?: number
  details?: unknown
}

export class UploadSDKError extends Error {
  override readonly name = "UploadSDKError"
  readonly code: UploadSDKErrorCode
  readonly statusCode: number
  declare readonly cause?: unknown
  readonly details?: unknown

  constructor(message: string, options: UploadSDKErrorOptions) {
    super(message, { cause: options.cause })

    this.code = options.code
    this.statusCode = options.statusCode ?? defaultStatusCodeForCode(options.code)
    this.details = options.details
  }
}

export function isUploadSDKError(error: unknown): error is UploadSDKError {
  return error instanceof UploadSDKError
}

export function toUploadSDKError(error: unknown, fallback: UploadSDKErrorFallback): UploadSDKError {
  if (isUploadSDKError(error)) {
    return error
  }

  return new UploadSDKError(fallback.message, {
    code: fallback.code,
    statusCode: fallback.statusCode,
    cause: error,
    details: fallback.details,
  })
}

function defaultStatusCodeForCode(code: UploadSDKErrorCode): number {
  return code === "INVALID_UPLOAD_INPUT" ? 400 : 500
}
