import "server-only"

import { awsS3, defineStorageProfiles, imageKit } from "@marinedotsh/upload-sdk"

function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export const storageProfiles = defineStorageProfiles({
  awsS3: awsS3({
    bucket: "upload-sdk-demo",
    region: "eu-west-2",
    credentials: {
      accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
    },
  }),
  imagekit: imageKit({
    privateKey: requireEnv("IMAGEKIT_PRIVATE_KEY"),
    publicKey: requireEnv("IMAGEKIT_PUBLIC_KEY"),
  }),
})

export type StorageProfileName = keyof typeof storageProfiles
