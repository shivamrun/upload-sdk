import "server-only"

import { createUploader } from "@evensurface/upload-sdk"
import { createUploadConfig } from "./upload-config"

export function createDemoUploader() {
  return createUploader(createUploadConfig())
}
