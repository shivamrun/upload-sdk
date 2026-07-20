import "server-only"

import { createUploader } from "@marinedotsh/upload-sdk"
import { createUploadConfig } from "./upload-config"

export function createDemoUploader() {
  return createUploader(createUploadConfig())
}
