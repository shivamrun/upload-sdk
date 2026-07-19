import "server-only"

import { createUploader } from "@marinedotsh/upload-sdk"
import { uploadConfig } from "./upload-config"

export const uploader = createUploader(uploadConfig)
