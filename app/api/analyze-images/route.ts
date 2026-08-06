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
  3;

const SIGNED_URL_LIFETIME_SECONDS =
  10 * 60;

const VISION_MAX_OUTPUT_TOKENS =
  4000;

const VISION_TIMEOUT_MILLISECONDS =
  90_000;

type GroqVisionContentItem = {
  type?: string;
  text?: string | null;
};

type GroqVisionOutputItem = {
  type?: string;
  role?: string;
  content?: GroqVisionContentItem[];
};

type GroqVisionResponse = {
  id?: string;
  status?: string | null;
  output_text?: string | null;
  output?: GroqVisionOutputItem[];

  incomplete_details?: {
    reason?: string | null;
  } | null;

  error?: {
    message?: string;
    type?: string;
    code?: string;
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

function createVisionInstruction(
  prompt: string,
  imageCount: number,
) {
  const visitorRequest =
    prompt ||
    (
      imageCount ===
      1
        ? "Analyze this image carefully."
        : "Analyze these images carefully and compare them when relevant."
    );

  return `
You are analyzing ${imageCount} uploaded image${imageCount === 1 ? "" : "s"}.

VISITOR REQUEST.

${visitorRequest}

ANALYSIS REQUIREMENTS.

Inspect every uploaded image before answering.

When multiple images are present, refer to them as Image 1, Image 2, and Image 3.

Answer the visitor's specific question first.

Then describe the important visual evidence supporting the answer.

For interface or website screenshots, evaluate layout, visual hierarchy, spacing, typography, colors, accessibility, mobile usability, content clarity, calls to action, trust signals, and visible technical problems.

For documents or screenshots containing text, read the visible text carefully.

Clearly distinguish readable text from unclear or partially visible text.

Do not invent hidden details.

Do not identify a real person by name from appearance alone.

Use clear Markdown headings, short paragraphs, and concise bullet points when useful.

Complete every section fully.

Do not finish with an incomplete sentence, heading, colon, or bullet point.

For broad requests, provide a complete but focused analysis rather than an excessively long unfinished response.
`.trim();
}

async function removeTemporaryImages(
  paths: string[],
) {
  if (
    paths.length ===
    0
  ) {
    return;
  }

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
    return;
  }

  try {
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
          paths,
        );

    if (
      error
    ) {
      console.error(
        "Temporary image cleanup failed.",
        error,
      );
    }
  } catch (error) {
    console.error(
      "Temporary image cleanup threw an error.",
      error,
    );
  }
}

export async function POST(
  request: Request,
) {
  const pathsToDelete:
    string[] =
    [];

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      VISION_TIMEOUT_MILLISECONDS,
    );

  request.signal.addEventListener(
    "abort",
    () => {
      controller.abort();
    },
    {
      once:
        true,
    },
  );

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
        "Provide between one and three valid uploaded image paths.",
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
                        createVisionInstruction(
                          prompt,
                          imageUrls.length,
                        ),
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
                VISION_MAX_OUTPUT_TOKENS,
            }),

          cache:
            "no-store",

          signal:
            controller.signal,
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

          model:
            visionModel,

          imageCount:
            imageUrls.length,
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

    const incompleteReason =
      result
        .incomplete_details
        ?.reason
        ?.trim();

    const wasIncomplete =
      result.status ===
        "incomplete" ||
      Boolean(
        incompleteReason,
      );

    if (
      wasIncomplete
    ) {
      console.warn(
        "Vision response was incomplete.",
        {
          status:
            result.status,

          incompleteReason,

          answerLength:
            answer.length,
        },
      );
    }

    const finalAnswer =
      wasIncomplete
        ? `${answer}\n\n> The image analysis reached its response limit. Ask me to continue from the last completed section.`
        : answer;

    return NextResponse.json({
      success:
        true,

      message:
        finalAnswer,

      model:
        visionModel,

      incomplete:
        wasIncomplete,

      incompleteReason:
        incompleteReason ||
        null,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.name ===
        "AbortError"
    ) {
      return createError(
        request.signal.aborted
          ? "The image analysis was cancelled."
          : "The image analysis took too long. Please try fewer images or ask a more focused question.",
        504,
      );
    }

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
    clearTimeout(
      timeout,
    );

    await removeTemporaryImages(
      pathsToDelete,
    );
  }
}
