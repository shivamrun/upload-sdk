import { defineUploadConfig } from "@marinedotsh/upload-sdk"

import { assets } from "./asset-rules"
import { storageProfiles } from "./providers"

export const uploadConfig = defineUploadConfig({
  storageProfiles: storageProfiles,
  defaultStorageProfile: "awsS3",
  assets,
})
