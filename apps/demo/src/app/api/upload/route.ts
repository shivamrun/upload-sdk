import { toUploadSDKError, UploadSDKError } from "@marinedotsh/upload-sdk"
import { createDemoUploader } from "@/server/uploader"

type UploadRequestBody = {
  name?: unknown
  contentType?: unknown
  size?: unknown
}

type UploadRequestData = {
  name: string
  contentType: string
  size: number
}

export async function POST(request: Request) {
  try {
    const body = await readUploadRequestBody(request)
    const uploader = createDemoUploader()

    const preparedUpload = await uploader.prepareUpload("avatar", {
      filename: body.name,
      contentType: body.contentType,
      size: body.size,
    })

    return Response.json({
      ...preparedUpload,
      file: {
        name: body.name,
        contentType: body.contentType,
        size: body.size,
      },
    })
  } catch (error) {
    const uploadError = toUploadSDKError(error, {
      code: "UPLOAD_PROVIDER_ERROR",
      message: "Upload could not be prepared.",
    })

    if (uploadError.statusCode >= 500) {
      console.error(uploadError)
    }

    return Response.json(
      {
        error: {
          code: uploadError.code,
          message:
            uploadError.statusCode >= 500 ? "Upload could not be prepared." : uploadError.message,
        },
      },
      { status: uploadError.statusCode },
    )
  }
}

async function readUploadRequestBody(request: Request): Promise<UploadRequestData> {
  let body: unknown

  try {
    body = await request.json()
  } catch (error) {
    throw new UploadSDKError("Send a valid JSON body.", {
      code: "INVALID_UPLOAD_INPUT",
      cause: error,
    })
  }

  if (!body || typeof body !== "object") {
    throw new UploadSDKError("Send name, contentType, and size.", {
      code: "INVALID_UPLOAD_INPUT",
    })
  }

  const uploadBody = body as UploadRequestBody

  if (
    typeof uploadBody.name !== "string" ||
    typeof uploadBody.contentType !== "string" ||
    typeof uploadBody.size !== "number"
  ) {
    throw new UploadSDKError("Send name, contentType, and size.", {
      code: "INVALID_UPLOAD_INPUT",
    })
  }

  return {
    name: uploadBody.name,
    contentType: uploadBody.contentType,
    size: uploadBody.size,
  }
}
