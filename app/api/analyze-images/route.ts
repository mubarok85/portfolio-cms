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

const GROQ_RESPONSES_ENDPOINT =
  "https://api.groq.com/openai/v1/responses";

const MAX_IMAGE_COUNT =
  5;

const SIGNED_URL_LIFETIME_SECONDS =
  10 * 60;

type GroqVisionResponse = {
  output_text?: string | null;

  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string | null;
    }>;
  }>;

  error?: {
    message?: string;
  };
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

function extractResponseText(
  result: GroqVisionResponse,
) {
  const directText =
    result.output_text?.trim();

  if (
    directText
  ) {
    return directText;
  }

  return (
    result.output
      ?.flatMap(
        (item) =>
          item.content ||
          [],
      )
      .filter(
        (item) =>
          item.type ===
            "output_text" &&
          typeof item.text ===
            "string",
      )
      .map(
        (item) =>
          item.text?.trim() ||
          "",
      )
      .filter(
        Boolean,
      )
      .join(
        "\n\n",
      )
      .trim() ||
    ""
  );
}

export async function POST(
  request: Request,
) {
  const pathsToDelete:
    string[] =
    [];

  try {
    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL
        ?.trim();

    const serviceRoleKey =
      process.env
        .SUPABASE_SERVICE_ROLE_KEY
        ?.trim();

    const groqApiKey =
      process.env
        .GROQ_API_KEY
        ?.trim();

    const visionModel =
      process.env
        .GROQ_VISION_MODEL
        ?.trim() ||
      "qwen/qwen3.6-27b";

    if (
      !supabaseUrl ||
      !serviceRoleKey ||
      !groqApiKey
    ) {
      return createError(
        "Image-analysis configuration is incomplete.",
        503,
      );
    }

    let body: {
      prompt?: unknown;
      paths?: unknown;
    };

    try {
      body =
        await request.json();
    } catch {
      return createError(
        "The image-analysis request is not valid JSON.",
        400,
      );
    }

    const prompt =
      typeof body.prompt ===
        "string"
        ? body.prompt
            .trim()
            .slice(
              0,
              5000,
            )
        : "";

    if (
      !Array.isArray(
        body.paths,
      ) ||
      body.paths.length ===
        0 ||
      body.paths.length >
        MAX_IMAGE_COUNT ||
      !body.paths.every(
        (path) =>
          typeof path ===
            "string" &&
          path.length >
            0 &&
          path.length <
            500,
      )
    ) {
      return createError(
        "Provide between one and five valid uploaded image paths.",
        400,
      );
    }

    const paths =
      body.paths as string[];

    pathsToDelete.push(
      ...paths,
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

    const {
      data:
        signedFiles,
      error:
        signedUrlError,
    } =
      await supabase
        .storage
        .from(
          BUCKET_NAME,
        )
        .createSignedUrls(
          paths,
          SIGNED_URL_LIFETIME_SECONDS,
        );

    if (
      signedUrlError ||
      !signedFiles
    ) {
      return createError(
        signedUrlError?.message ||
          "Could not open the uploaded images.",
        500,
      );
    }

    const imageUrls =
      signedFiles
        .map(
          (file) =>
            file.signedUrl,
        )
        .filter(
          (
            url,
          ): url is string =>
            Boolean(
              url,
            ),
        );

    if (
      imageUrls.length !==
      paths.length
    ) {
      return createError(
        "One or more uploaded images could not be accessed.",
        500,
      );
    }

    const userPrompt =
      prompt ||
      (
        imageUrls.length ===
        1
          ? "Analyze this image carefully. Describe the important details and explain anything notable."
          : "Analyze these images together. Compare them when relevant, describe the important details, and explain anything notable."
      );

    const response =
      await fetch(
        GROQ_RESPONSES_ENDPOINT,
        {
          method:
            "POST",

          headers: {
            Authorization:
              `Bearer ${groqApiKey}`,

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              model:
                visionModel,

              input: [
                {
                  role:
                    "user",

                  content: [
                    {
                      type:
                        "input_text",

                      text:
                        userPrompt,
                    },

                    ...imageUrls.map(
                      (
                        imageUrl,
                      ) => ({
                        type:
                          "input_image",

                        image_url:
                          imageUrl,
                      }),
                    ),
                  ],
                },
              ],

              max_output_tokens:
                1800,
            }),

          cache:
            "no-store",
        },
      );

    let result:
      GroqVisionResponse;

    try {
      result =
        (await response.json()) as GroqVisionResponse;
    } catch {
      return createError(
        `The vision model returned an unreadable response with status ${response.status}.`,
        502,
      );
    }

    if (
      !response.ok
    ) {
      const providerMessage =
        result.error
          ?.message
          ?.trim();

      console.error(
        "Groq vision request failed.",
        {
          status:
            response.status,

          providerMessage,
        },
      );

      return createError(
        providerMessage ||
          `Image analysis failed with status ${response.status}.`,
        response.status,
      );
    }

    const answer =
      extractResponseText(
        result,
      );

    if (
      !answer
    ) {
      return createError(
        "The vision model returned an empty response.",
        502,
      );
    }

    return NextResponse.json({
      success:
        true,

      message:
        answer,

      model:
        visionModel,
    });
  } catch (error) {
    console.error(
      "Image-analysis route error.",
      error,
    );

    return createError(
      error instanceof Error
        ? error.message
        : "The images could not be analyzed.",
      500,
    );
  } finally {
    if (
      pathsToDelete.length >
      0
    ) {
      const supabaseUrl =
        process.env
          .NEXT_PUBLIC_SUPABASE_URL
          ?.trim();

      const serviceRoleKey =
        process.env
          .SUPABASE_SERVICE_ROLE_KEY
          ?.trim();

      if (
        supabaseUrl &&
        serviceRoleKey
      ) {
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

        const {
          error,
        } =
          await supabase
            .storage
            .from(
              BUCKET_NAME,
            )
            .remove(
              pathsToDelete,
            );

        if (
          error
        ) {
          console.error(
            "Temporary image cleanup failed.",
            error,
          );
        }
      }
    }
  }
}
