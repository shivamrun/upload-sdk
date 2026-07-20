# @marinedotsh/upload-sdk

Generate provider-agnostic signed upload targets for S3 and ImageKit.

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
    limits: {
      maxFileSize: { value: 1, unit: "MB" },
    },
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

`preparedUpload` returns a multipart upload target with form fields for direct browser `POST` uploads.

`limits.maxFileSize` is checked before a provider signature is generated. Providers also receive
the limit for upload-time enforcement: S3 uses a `content-length-range` policy, and ImageKit
receives a V2 upload JWT that includes a `checks` expression.

## Providers

- `awsS3`
- `imageKit`

## License

MIT
