import { defineAssets } from "@marinedotsh/upload-sdk"

import { storageProfiles } from "./providers"

export const assets = defineAssets(storageProfiles, {
  avatar: {
    keyPrefix: "uploads/avatars",
  },

  banner: {
    keyPrefix: "uploads/banners",
  },

  post: {
    keyPrefix: "uploads/posts",
  },
})

export type AssetName = keyof typeof assets
