import "server-only"

import { awsS3, defineStorageProfiles, imageKit, UploadSDKError } from "@marinedotsh/upload-sdk"

function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new UploadSDKError(`Missing required environment variable: ${name}`, {
      code: "INVALID_UPLOAD_CONFIG",
    })
  }

  return value
}

export function createStorageProfiles() {
  return defineStorageProfiles({
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
}

export type StorageProfileName = keyof ReturnType<typeof createStorageProfiles>
