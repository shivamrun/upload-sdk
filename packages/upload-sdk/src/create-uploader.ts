import { toUploadSDKError, UploadSDKError } from "./error"
import type { AssetUploadConfig, StorageProvider } from "./types"
import { resolveDurationSeconds } from "./validation/duration"
import { generateFileName, sanitizeFileName } from "./validation/file"
import { resolveFileSizeLimitBytes } from "./validation/file-size"
import { sanitizeKeyPrefix } from "./validation/key-prefix"
import { validateUploadInput } from "./validation/upload-input"

type PrepareUploadInput = {
  filename: string
  contentType: string
  size: number
}

export function createUploader<
  const TStorageProfiles extends Record<string, StorageProvider>,
  const TAssets extends Record<string, AssetUploadConfig<Extract<keyof TStorageProfiles, string>>>,
>(config: {
  storageProfiles: TStorageProfiles
  defaultStorageProfile: Extract<keyof TStorageProfiles, string>
  assets: TAssets
}) {
  async function prepareUpload<TAssetName extends Extract<keyof TAssets, string>>(
    assetName: TAssetName,
    input: PrepareUploadInput,
  ) {
    try {
      const asset = config.assets[assetName]

      const storageProfileName = asset.storageProfile ?? config.defaultStorageProfile
      const storageProfile = config.storageProfiles[storageProfileName]

      if (!storageProfile.prepareUpload) {
        throw new UploadSDKError(
          `Storage profile "${storageProfileName}" does not support prepareUpload`,
          {
            code: "UNSUPPORTED_UPLOAD_OPERATION",
          },
        )
      }

      const sanitizedFileName = sanitizeFileName(input.filename)
      const expiresInSeconds = resolveDurationSeconds(asset.expiresIn)
      const maxFileSizeBytes = resolveFileSizeLimitBytes(asset.limits?.maxFileSize)

      const contentType = validateUploadInput({
        asset,
        contentType: input.contentType,
        fileExtension: sanitizedFileName.extension,
        size: input.size,
      })

      const key = `${sanitizeKeyPrefix(asset.keyPrefix)}/${generateFileName(input.filename)}`

      const preparedUpload = await storageProfile.prepareUpload({
        key,
        contentType,
        expiresInSeconds,
        accept: asset.accept,
        metadata: asset.metadata,
        limits: {
          maxFileSizeBytes,
        },
      })

      return preparedUpload
    } catch (error) {
      throw toUploadSDKError(error, {
        code: "UPLOAD_PROVIDER_ERROR",
        message: "Upload could not be prepared.",
      })
    }
  }

  return {
    prepareUpload,
  }
}
