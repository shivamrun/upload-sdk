import { uploader } from "@/server/uploader"

type UploadRequestBody = {
  name?: unknown
  contentType?: unknown
  size?: unknown
}

export async function POST(request: Request) {
  const body = (await request.json()) as UploadRequestBody

  if (
    typeof body.name !== "string" ||
    typeof body.contentType !== "string" ||
    typeof body.size !== "number"
  ) {
    return Response.json({ error: "Send name, contentType, and size." }, { status: 400 })
  }

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
}
