import type { AssetUploadConfig } from "@marinedotsh/upload-sdk"
import type { StorageProfileName } from "./providers"

export const assets = {
  avatar: {
    storageProfile: "awsS3",
    keyPrefix: "uploads/avatars",
    limits: {
      maxFileSize: { value: 1, unit: "MB" },
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
      maxFileSize: { value: 10, unit: "MB" },
    },
    accept: {
      mimeTypes: ["image/*"],
      extensions: ["jpg", "jpeg", "png", "webp"],
    },
  },

  post: {
    keyPrefix: "uploads/posts",
    limits: {
      maxFileSize: { value: 25, unit: "MB" },
    },
    accept: {
      mimeTypes: ["image/*", "video/*"],
      extensions: ["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm"],
    },
  },
} satisfies Record<string, AssetUploadConfig<StorageProfileName>>

export type AssetName = keyof typeof assets
