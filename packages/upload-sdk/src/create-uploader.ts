import type { AssetUploadConfig, StorageProvider } from "./types"
import { generateFileName } from "./validation/file"
import { sanitizeKeyPrefix } from "./validation/key-prefix"

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
    const asset = config.assets[assetName]

    const storageProfileName = asset.storageProfile ?? config.defaultStorageProfile

    const storageProfile = config.storageProfiles[storageProfileName]

    if (!storageProfile.prepareUpload) {
      throw new Error(`Storage profile "${storageProfileName}" does not support prepareUpload`)
    }

    const key = `${sanitizeKeyPrefix(asset.keyPrefix)}/${generateFileName(input.filename)}`

    return storageProfile.prepareUpload({
      key,
      contentType: input.contentType,
      metadata: asset.metadata,
    })
  }

  return {
    prepareUpload,
  }
}
