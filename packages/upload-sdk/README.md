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

`limits.maxFileSize` and `accept` rules are checked before a provider signature is generated.
Providers also enforce the signed upload request where supported: S3 signs the generated key,
content type, and size range into its POST policy, while ImageKit receives a V2 upload JWT with a
`checks` expression for size and MIME type validation.

## Providers

- `awsS3`
- `imageKit`

## License

MIT
