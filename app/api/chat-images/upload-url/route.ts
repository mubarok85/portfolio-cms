import {
  NextResponse,
} from "next/server";
import {
  createClient,
} from "@supabase/supabase-js";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const BUCKET_NAME =
  "chatbot-uploads";

const MAX_IMAGE_COUNT =
  5;

const MAX_OPTIMIZED_BYTES =
  3 * 1024 * 1024;

const ALLOWED_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

type UploadRequestItem = {
  id?: unknown;
  name?: unknown;
  type?: unknown;
  size?: unknown;
};

function createError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success:
        false,

      message,
    },
    {
      status,
    },
  );
}

function sanitizeFileName(
  name: string,
) {
  const baseName =
    name
      .toLowerCase()
      .replace(
        /[^a-z0-9._-]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      );

  return (
    baseName ||
    "image.webp"
  );
}

export async function POST(
  request: Request,
) {
  try {
    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL
        ?.trim();

    const serviceRoleKey =
      process.env
        .SUPABASE_SERVICE_ROLE_KEY
        ?.trim();

    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      return createError(
        "Supabase upload configuration is missing.",
        503,
      );
    }

    let body: {
      sessionId?: unknown;
      files?: unknown;
    };

    try {
      body =
        await request.json();
    } catch {
      return createError(
        "The upload request is not valid JSON.",
        400,
      );
    }

    if (
      !Array.isArray(
        body.files,
      ) ||
      body.files.length ===
        0 ||
      body.files.length >
        MAX_IMAGE_COUNT
    ) {
      return createError(
        "Select between one and five images.",
        400,
      );
    }

    const sessionId =
      typeof body.sessionId ===
        "string" &&
      body.sessionId.trim()
        ? body.sessionId
            .trim()
            .replace(
              /[^a-zA-Z0-9_-]/g,
              "",
            )
            .slice(
              0,
              80,
            )
        : crypto.randomUUID();

    const validatedFiles =
      body.files.map(
        (
          rawFile,
        ) => {
          const file =
            rawFile as UploadRequestItem;

          if (
            typeof file.id !==
              "string" ||
            typeof file.name !==
              "string" ||
            typeof file.type !==
              "string" ||
            typeof file.size !==
              "number"
          ) {
            throw new Error(
              "One of the image descriptions is invalid.",
            );
          }

          if (
            !ALLOWED_TYPES.has(
              file.type,
            )
          ) {
            throw new Error(
              `${file.name} has an unsupported file type.`,
            );
          }

          if (
            file.size <=
              0 ||
            file.size >
              MAX_OPTIMIZED_BYTES
          ) {
            throw new Error(
              `${file.name} is larger than the 3 MB analysis limit.`,
            );
          }

          return {
            id:
              file.id,

            name:
              sanitizeFileName(
                file.name,
              ),

            type:
              file.type,

            size:
              file.size,
          };
        },
      );

    const supabase =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            persistSession:
              false,

            autoRefreshToken:
              false,
          },
        },
      );

    const uploads =
      await Promise.all(
        validatedFiles.map(
          async (
            file,
          ) => {
            const path =
              `${sessionId}/${Date.now()}-${crypto.randomUUID()}-${file.name}`;

            const {
              data,
              error,
            } =
              await supabase
                .storage
                .from(
                  BUCKET_NAME,
                )
                .createSignedUploadUrl(
                  path,
                  {
                    upsert:
                      false,
                  },
                );

            if (
              error ||
              !data
            ) {
              throw new Error(
                error?.message ||
                  `Could not create an upload URL for ${file.name}.`,
              );
            }

            return {
              id:
                file.id,

              path,

              token:
                data.token,
            };
          },
        ),
      );

    return NextResponse.json({
      success:
        true,

      uploads,
    });
  } catch (error) {
    console.error(
      "Signed image upload error.",
      error,
    );

    return createError(
      error instanceof Error
        ? error.message
        : "Could not prepare the image uploads.",
      500,
    );
  }
}
