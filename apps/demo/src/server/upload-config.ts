import { defineUploadConfig } from "@marinedotsh/upload-sdk"

import { assets } from "./asset-rules"
import { createStorageProfiles } from "./providers"

export function createUploadConfig() {
  return defineUploadConfig({
    storageProfiles: createStorageProfiles(),
    defaultStorageProfile: "awsS3",
    assets,
  })
}
