# @marinedotsh/upload-sdk

Generate provider-agnostic signed upload targets for S3, Cloudinary, and ImageKit.

## Installation

```sh
pnpm add @marinedotsh/upload-sdk
# or
bun add @marinedotsh/upload-sdk
# or
yarn add @marinedotsh/upload-sdk
```

## Usage

```ts
import { awsS3, createUploader, defineAssets, defineStorageProfiles } from "@marinedotsh/upload-sdk"

const storageProfiles = defineStorageProfiles({
  s3: awsS3({
    bucket: "my-bucket",
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  }),
})

const assets = defineAssets(storageProfiles, {
  avatar: {
    keyPrefix: "uploads/avatars",
  },
})

const uploader = createUploader({
  storageProfiles,
  defaultStorageProfile: "s3",
  assets,
})

const preparedUpload = await uploader.prepareUpload("avatar", {
  filename: "profile.png",
  contentType: "image/png",
  size: 120_000,
})
```

`preparedUpload` returns either a raw upload target for direct `PUT` uploads or a multipart upload target with form fields for providers that need `POST` uploads.

## Providers

- `awsS3`
- `cloudinary`
- `imageKit`

## License

MIT
