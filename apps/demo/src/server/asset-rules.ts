import type { AssetUploadConfig } from "@marinedotsh/upload-sdk"

import type { StorageProfileName } from "./providers"

export const assets = {
  avatar: {
    storageProfile: "awsS3",
    keyPrefix: "uploads/avatars",
    limits: {
      maxFileSizeBytes: 1 * 1024 * 1024,
      maxFiles: 3,
    },
    accept: {
      mimeTypes: ["image/*"],
      extensions: ["jpg", "jpeg", "png", "webp", "gif"],
    },
  },

  banner: {
    keyPrefix: "uploads/banners",
    limits: {
      maxFileSizeBytes: 10 * 1024 * 1024,
    },
    accept: {
      mimeTypes: ["image/*"],
      extensions: ["jpg", "jpeg", "png", "webp"],
    },
  },

  post: {
    keyPrefix: "uploads/posts",
    limits: {
      maxFileSizeBytes: 25 * 1024 * 1024,
    },
    accept: {
      mimeTypes: ["image/*", "video/*"],
      extensions: ["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm"],
    },
  },
} satisfies Record<string, AssetUploadConfig<StorageProfileName>>

export type AssetName = keyof typeof assets
