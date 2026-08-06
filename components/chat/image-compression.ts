import type {
  PendingImageAttachment,
} from "./types";

export const MAX_IMAGE_COUNT =
  5;

export const MAX_ORIGINAL_IMAGE_BYTES =
  15 * 1024 * 1024;

export const MAX_ANALYSIS_IMAGE_BYTES =
  3 * 1024 * 1024;

export const MAX_IMAGE_DIMENSION =
  2048;

const SUPPORTED_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

const QUALITY_STEPS = [
  0.88,
  0.82,
  0.76,
  0.7,
  0.64,
  0.58,
];

function createAttachmentId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function replaceFileExtension(
  fileName: string,
  extension: string,
) {
  const baseName =
    fileName.replace(
      /\.[^/.]+$/,
      "",
    );

  return `${baseName}.${extension}`;
}

function loadBrowserImage(
  file: File,
) {
  return new Promise<HTMLImageElement>(
    (
      resolve,
      reject,
    ) => {
      const objectUrl =
        URL.createObjectURL(
          file,
        );

      const image =
        new Image();

      image.onload =
        () => {
          URL.revokeObjectURL(
            objectUrl,
          );

          resolve(
            image,
          );
        };

      image.onerror =
        () => {
          URL.revokeObjectURL(
            objectUrl,
          );

          reject(
            new Error(
              `Could not read ${file.name}.`,
            ),
          );
        };

      image.src =
        objectUrl;
    },
  );
}

function calculateDimensions(
  width: number,
  height: number,
) {
  const longestSide =
    Math.max(
      width,
      height,
    );

  if (
    longestSide <=
    MAX_IMAGE_DIMENSION
  ) {
    return {
      width,
      height,
    };
  }

  const scale =
    MAX_IMAGE_DIMENSION /
    longestSide;

  return {
    width:
      Math.max(
        1,
        Math.round(
          width *
          scale,
        ),
      ),

    height:
      Math.max(
        1,
        Math.round(
          height *
          scale,
        ),
      ),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob>(
    (
      resolve,
      reject,
    ) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "The browser could not compress this image.",
              ),
            );

            return;
          }

          resolve(
            blob,
          );
        },
        type,
        quality,
      );
    },
  );
}

async function compressImage(
  file: File,
) {
  const image =
    await loadBrowserImage(
      file,
    );

  let {
    width,
    height,
  } =
    calculateDimensions(
      image.naturalWidth,
      image.naturalHeight,
    );

  let bestBlob:
    Blob | null =
      null;

  for (
    let resizeAttempt = 0;
    resizeAttempt < 3;
    resizeAttempt += 1
  ) {
    const canvas =
      document.createElement(
        "canvas",
      );

    canvas.width =
      width;

    canvas.height =
      height;

    const context =
      canvas.getContext(
        "2d",
        {
          alpha:
            false,
        },
      );

    if (!context) {
      throw new Error(
        "Your browser does not support image compression.",
      );
    }

    context.imageSmoothingEnabled =
      true;

    context.imageSmoothingQuality =
      "high";

    context.fillStyle =
      "#ffffff";

    context.fillRect(
      0,
      0,
      width,
      height,
    );

    context.drawImage(
      image,
      0,
      0,
      width,
      height,
    );

    for (
      const quality of
      QUALITY_STEPS
    ) {
      const blob =
        await canvasToBlob(
          canvas,
          "image/webp",
          quality,
        );

      bestBlob =
        blob;

      if (
        blob.size <=
        MAX_ANALYSIS_IMAGE_BYTES
      ) {
        return {
          blob,
          width,
          height,
          type:
            "image/webp",
        };
      }
    }

    width =
      Math.max(
        1,
        Math.round(
          width *
          0.82,
        ),
      );

    height =
      Math.max(
        1,
        Math.round(
          height *
          0.82,
        ),
      );
  }

  if (!bestBlob) {
    throw new Error(
      `Could not optimize ${file.name}.`,
    );
  }

  return {
    blob:
      bestBlob,

    width,
    height,

    type:
      "image/webp",
  };
}

export function validateImageFile(
  file: File,
) {
  if (
    !SUPPORTED_IMAGE_TYPES.has(
      file.type,
    )
  ) {
    throw new Error(
      `${file.name} is not supported. Use JPG, PNG, or WebP.`,
    );
  }

  if (
    file.size >
    MAX_ORIGINAL_IMAGE_BYTES
  ) {
    throw new Error(
      `${file.name} is larger than 15 MB.`,
    );
  }
}

export async function prepareImageAttachment(
  file: File,
): Promise<PendingImageAttachment> {
  validateImageFile(
    file,
  );

  const optimized =
    await compressImage(
      file,
    );

  const optimizedFile =
    new File(
      [
        optimized.blob,
      ],
      replaceFileExtension(
        file.name,
        "webp",
      ),
      {
        type:
          optimized.type,

        lastModified:
          Date.now(),
      },
    );

  return {
    id:
      createAttachmentId(),

    originalName:
      file.name,

    originalSize:
      file.size,

    optimizedSize:
      optimizedFile.size,

    width:
      optimized.width,

    height:
      optimized.height,

    file:
      optimizedFile,

    previewUrl:
      URL.createObjectURL(
        file,
      ),

    status:
      "ready",

    progress:
      0,

    storagePath:
      null,

    error:
      null,
  };
}

export function formatFileSize(
  bytes: number,
) {
  if (
    bytes <
    1024
  ) {
    return `${bytes} B`;
  }

  const kilobytes =
    bytes /
    1024;

  if (
    kilobytes <
    1024
  ) {
    return `${kilobytes.toFixed(
      1,
    )} KB`;
  }

  return `${(
    kilobytes /
    1024
  ).toFixed(1)} MB`;
}
