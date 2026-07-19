export type MetadataValue = string | number | boolean

// TODO(metadata): consider provider-specific metadata types so shared SDK
// metadata does not force unsupported fields or shapes onto every provider.
export type UploadMetadata = Record<string, MetadataValue>

export type ProviderPrepareUploadInput = {
  key: string
  contentType: string
  expiresInSeconds?: number
  metadata?: UploadMetadata
}

export type PrepareUploadOutput =
  | {
      strategy: "raw"
      url: string
      method: "PUT"
      headers: Record<string, string>
      key: string
      expiresAt: string
    }
  | {
      strategy: "multipart"
      url: string
      method: "POST"
      headers: Record<string, string>
      fields: Record<string, string>
      key: string
      expiresAt: string
    }

export type StorageProvider = {
  prepareUpload(input: ProviderPrepareUploadInput): Promise<PrepareUploadOutput>
}

export type AssetUploadConfig<TStorageProfileName extends string = string> = {
  storageProfile?: TStorageProfileName
  keyPrefix: string

  limits?: {
    maxFileSizeBytes?: number
    maxFiles?: number
    concurrency?: number
  }

  accept?: {
    mimeTypes?: readonly string[]
    extensions?: readonly string[]
  }

  metadata?: UploadMetadata
}

export function defineStorageProfiles<
  const TStorageProfiles extends Record<string, StorageProvider>,
>(storageProfiles: TStorageProfiles): TStorageProfiles {
  return storageProfiles
}

export function defineAssets<
  const TStorageProfiles extends Record<string, StorageProvider>,
  const TAssets extends Record<string, AssetUploadConfig<Extract<keyof TStorageProfiles, string>>>,
>(_storageProfiles: TStorageProfiles, assets: TAssets): TAssets {
  return assets
}

export function defineUploadConfig<
  const TStorageProfiles extends Record<string, StorageProvider>,
  const TAssets extends Record<string, AssetUploadConfig<Extract<keyof TStorageProfiles, string>>>,
>(config: {
  storageProfiles: TStorageProfiles
  defaultStorageProfile: Extract<keyof TStorageProfiles, string>
  assets: TAssets
}) {
  return config
}
