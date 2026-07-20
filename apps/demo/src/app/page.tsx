"use client";

import { type FormEvent, useRef, useState } from "react";
import { assets } from "@/server/asset-rules";

const uploadAsset = assets.avatar;
const maxFiles = uploadAsset.limits?.maxFiles ?? 1;
const allowsMultipleFiles = maxFiles > 1;

type PreparedUpload = {
  url: string;
  headers: Record<string, string>;
  strategy: "multipart";
  method: "POST";
  fields: Record<string, string>;
};

type Status =
  | { type: "idle"; message: "" }
  | { type: "uploading"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>({
    type: "idle",
    message: "",
  });

  const isUploading = status.type === "uploading";

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (files.length === 0) {
      setStatus({
        type: "error",
        message: allowsMultipleFiles ? "Choose files first." : "Choose a file first.",
      });

      return;
    }

    try {
      const clientValidationError = validateFiles(files, uploadAsset);

      if (clientValidationError) {
        setStatus({
          type: "error",
          message: clientValidationError,
        });

        return;
      }

      setStatus({
        type: "uploading",
        message:
          files.length === 1
            ? "Uploading your file..."
            : `Uploading 1 of ${files.length} files...`,
      });

      for (const [index, selectedFile] of files.entries()) {
        if (files.length > 1 && index > 0) {
          setStatus({
            type: "uploading",
            message: `Uploading ${index + 1} of ${files.length} files...`,
          });
        }

        await uploadFile(selectedFile);
      }

      setStatus({
        type: "success",
        message:
          files.length === 1
            ? "File uploaded successfully."
            : `${files.length} files uploaded successfully.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Upload failed.",
      });
    }
  }

  function handleFiles(fileList: FileList | null) {
    const selectedFiles = fileList ? Array.from(fileList) : [];
    const nextFiles = allowsMultipleFiles
      ? selectedFiles.slice(0, maxFiles)
      : selectedFiles.slice(0, 1);
    const validationError =
      selectedFiles.length > maxFiles
        ? `You can upload up to ${maxFiles} ${pluralize("file", maxFiles)} at a time.`
        : validateFiles(nextFiles, uploadAsset);

    setFiles(nextFiles);
    setStatus(
      validationError
        ? {
            type: "error",
            message: validationError,
          }
        : { type: "idle", message: "" },
    );
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30">
        <div className="mb-6">
          <div className="mb-4 grid size-12 place-items-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
            <UploadIcon className="size-5" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Upload a file
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Select a file and upload it securely to your storage provider.
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept={createFileInputAccept(uploadAsset)}
            className="sr-only"
            multiple={allowsMultipleFiles}
            onChange={(event) => handleFiles(event.target.files)}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex min-h-44 w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 text-center transition hover:border-zinc-400 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 dark:focus-visible:ring-zinc-50 dark:focus-visible:ring-offset-zinc-900"
          >
            <div className="mb-4 grid size-11 place-items-center rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <FileIcon className="size-5" />
            </div>

            {files.length > 0 ? (
              <>
                <span className="max-w-full truncate text-sm font-medium">
                  {formatSelectedFiles(files)}
                </span>

                <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatSelectedFilesMeta(files)}
                </span>

                <span className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Click to replace
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-medium">Choose a file</span>

                <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Click to browse your device
                </span>
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={isUploading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {isUploading ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-950/30 dark:border-t-zinc-950" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="size-4" />
                Upload file
              </>
            )}
          </button>
        </form>

        {status.message && (
          <div
            role="status"
            className={[
              "mt-4 flex items-start gap-2 rounded-xl border px-3 py-3 text-sm",
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                : status.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400",
            ].join(" ")}
          >
            {status.type === "success" && (
              <CheckIcon className="mt-0.5 size-4 shrink-0" />
            )}

            {status.type === "error" && (
              <ErrorIcon className="mt-0.5 size-4 shrink-0" />
            )}

            {status.message}
          </div>
        )}
      </section>
    </main>
  );
}

async function uploadFile(file: File) {
  const contentType = file.type || "application/octet-stream";

  const prepareResponse = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: file.name,
      contentType,
      size: file.size,
    }),
  });

  const prepared = (await prepareResponse.json()) as
    | PreparedUpload
    | { error?: string };

  if (!prepareResponse.ok || !("url" in prepared)) {
    throw new Error(
      "error" in prepared && prepared.error
        ? prepared.error
        : "Failed to prepare upload.",
    );
  }

  const uploadResponse = await uploadMultipart(prepared, file);

  if (!uploadResponse.ok) {
    throw new Error((await uploadResponse.text()) || "File upload failed.");
  }
}

async function uploadMultipart(prepared: PreparedUpload, file: File) {
  const formData = new FormData();

  for (const [name, value] of Object.entries(prepared.fields)) {
    formData.append(name, value);
  }

  formData.append("file", file);

  return fetch(prepared.url, {
    method: prepared.method,
    headers: prepared.headers,
    body: formData,
  });
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 bytes";

  const units = ["bytes", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** index;

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function createFileInputAccept(asset: typeof uploadAsset) {
  return [
    ...(asset.accept?.mimeTypes ?? []),
    ...(asset.accept?.extensions ?? []).map((extension) => `.${extension}`),
  ].join(",");
}

function formatSelectedFiles(files: File[]) {
  if (files.length === 1) {
    return files[0].name;
  }

  return `${files.length} ${pluralize("file", files.length)} selected`;
}

function formatSelectedFilesMeta(files: File[]) {
  if (files.length === 1) {
    const [file] = files;

    return `${file.type || "Unknown type"} - ${formatBytes(file.size)}`;
  }

  const totalBytes = files.reduce((total, file) => total + file.size, 0);

  return `${formatBytes(totalBytes)} total`;
}

function validateFiles(files: File[], asset: typeof uploadAsset): string | null {
  if (files.length === 0) {
    return null;
  }

  if (files.length > maxFiles) {
    return `You can upload up to ${maxFiles} ${pluralize("file", maxFiles)} at a time.`;
  }

  for (const file of files) {
    const validationError = validateFile(file, asset);

    if (validationError) {
      return files.length === 1 ? validationError : `${file.name}: ${validationError}`;
    }
  }

  return null;
}

function validateFile(file: File, asset: typeof uploadAsset): string | null {
  const maxFileSizeBytes = resolveMaxFileSizeBytes(asset.limits?.maxFileSize);

  if (maxFileSizeBytes && file.size > maxFileSizeBytes) {
    return `File must be ${formatBytes(maxFileSizeBytes)} or smaller.`;
  }

  const contentType = file.type.toLowerCase();

  if (
    asset.accept?.mimeTypes?.length &&
    !asset.accept.mimeTypes.some((mimeType) =>
      matchesMimeType(mimeType, contentType),
    )
  ) {
    return `File type "${file.type || "unknown"}" is not allowed.`;
  }

  const extension = getFileExtension(file.name);

  if (
    asset.accept?.extensions?.length &&
    (!extension ||
      !asset.accept.extensions.some(
        (acceptedExtension) => acceptedExtension.toLowerCase() === extension,
      ))
  ) {
    return `File extension "${extension ? `.${extension}` : "none"}" is not allowed.`;
  }

  return null;
}

function matchesMimeType(acceptedMimeType: string, contentType: string) {
  const normalizedAcceptedMimeType = acceptedMimeType.toLowerCase();

  if (normalizedAcceptedMimeType === contentType) {
    return true;
  }

  if (!normalizedAcceptedMimeType.endsWith("/*")) {
    return false;
  }

  return contentType.startsWith(normalizedAcceptedMimeType.slice(0, -1));
}

function getFileExtension(filename: string) {
  const lastDotIndex = filename.lastIndexOf(".");

  if (lastDotIndex <= 0 || lastDotIndex === filename.length - 1) {
    return null;
  }

  return filename.slice(lastDotIndex + 1).toLowerCase();
}

function resolveMaxFileSizeBytes(
  limit: { value: number; unit: "KB" | "MB" | "GB" | "TB" } | undefined,
) {
  if (!limit) {
    return undefined;
  }

  const unitBytes = {
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  } satisfies Record<typeof limit.unit, number>;

  return limit.value * unitBytes[limit.unit];
}

function pluralize(word: string, count: number) {
  return count === 1 ? word : `${word}s`;
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
