import { InferenceClient } from "@huggingface/inference";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(3)
    .max(1000),
});

type RequestRecord = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS =
  60 * 60 * 1000;

const RATE_LIMIT_REQUESTS = 3;

const requestLog =
  new Map<string, RequestRecord>();

function getClientIdentifier(
  request: Request,
) {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for",
    );

  const firstAddress =
    forwardedFor
      ?.split(",")[0]
      ?.trim();

  return (
    firstAddress ||
    request.headers.get(
      "x-real-ip",
    ) ||
    "anonymous"
  );
}

function isRateLimited(
  identifier: string,
) {
  const now = Date.now();

  const current =
    requestLog.get(identifier);

  if (
    !current ||
    current.resetAt <= now
  ) {
    requestLog.set(identifier, {
      count: 1,
      resetAt:
        now +
        RATE_LIMIT_WINDOW_MS,
    });

    return false;
  }

  if (
    current.count >=
    RATE_LIMIT_REQUESTS
  ) {
    return true;
  }

  requestLog.set(identifier, {
    count:
      current.count + 1,
    resetAt:
      current.resetAt,
  });

  return false;
}

function createErrorResponse(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
    },
  );
}

function createImprovedPrompt(
  prompt: string,
) {
  return [
    prompt.trim(),
    "Premium professional composition.",
    "Highly detailed.",
    "Clean cinematic lighting.",
    "Balanced visual hierarchy.",
    "High-quality digital artwork.",
    "No watermark.",
    "No visible signature.",
    "No unnecessary text.",
  ].join(" ");
}

function getImageExtension(
  contentType: string,
) {
  if (
    contentType.includes("jpeg") ||
    contentType.includes("jpg")
  ) {
    return "jpg";
  }

  if (
    contentType.includes("webp")
  ) {
    return "webp";
  }

  return "png";
}

export async function POST(
  request: Request,
) {
  try {
    const identifier =
      getClientIdentifier(request);

    if (
      isRateLimited(identifier)
    ) {
      return createErrorResponse(
        "The free image-generation limit has been reached. Please try again later.",
        429,
      );
    }

    const token =
      process.env.HF_TOKEN?.trim();

    if (!token) {
      return createErrorResponse(
        "Image generation is unavailable because the Hugging Face server token is missing.",
        503,
      );
    }

    let requestBody: unknown;

    try {
      requestBody =
        await request.json();
    } catch {
      return createErrorResponse(
        "The image request is not valid JSON.",
        400,
      );
    }

    const validation =
      requestSchema.safeParse(
        requestBody,
      );

    if (!validation.success) {
      return createErrorResponse(
        "Please provide an image description between 3 and 1,000 characters.",
        400,
      );
    }

    const model =
      process.env
        .HF_IMAGE_MODEL
        ?.trim() ||
      "black-forest-labs/FLUX.1-schnell";

    const client =
      new InferenceClient(token);

    const controller =
      new AbortController();

    const timeout =
      setTimeout(() => {
        controller.abort();
      }, 90000);

    try {
      const imageBlob =
        await client.textToImage(
          {
            provider: "auto",
            model,
            inputs:
              createImprovedPrompt(
                validation.data
                  .prompt,
              ),
          },
          {
            signal:
              controller.signal,
          },
        );

      const imageBuffer =
        await imageBlob.arrayBuffer();

      if (
        imageBuffer.byteLength ===
        0
      ) {
        throw new Error(
          "Hugging Face returned an empty image.",
        );
      }

      const contentType =
        imageBlob.type ||
        "image/png";

      const extension =
        getImageExtension(
          contentType,
        );

      return new Response(
        imageBuffer,
        {
          status: 200,

          headers: {
            "Content-Type":
              contentType,

            "Content-Length":
              String(
                imageBuffer.byteLength,
              ),

            "Content-Disposition":
              `inline; filename="mubarok-ai-image.${extension}"`,

            "Cache-Control":
              "no-store, max-age=0",

            "X-Content-Type-Options":
              "nosniff",

            "X-Generated-By":
              "hugging-face",
          },
        },
      );
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.name ===
        "AbortError"
    ) {
      return createErrorResponse(
        "Image generation took too long. Please try a simpler prompt.",
        504,
      );
    }

    console.error(
      "Image generation error.",
      error,
    );

    const providerMessage =
      error instanceof Error
        ? error.message
        : "";

    const normalizedMessage =
      providerMessage
        .toLowerCase();

    if (
      normalizedMessage.includes(
        "quota",
      ) ||
      normalizedMessage.includes(
        "credit",
      ) ||
      normalizedMessage.includes(
        "payment",
      ) ||
      normalizedMessage.includes(
        "billing",
      ) ||
      normalizedMessage.includes(
        "insufficient",
      )
    ) {
      return createErrorResponse(
        "The free Hugging Face image-generation allowance is currently exhausted.",
        429,
      );
    }

    if (
      normalizedMessage.includes(
        "unauthorized",
      ) ||
      normalizedMessage.includes(
        "authentication",
      ) ||
      normalizedMessage.includes(
        "token",
      ) ||
      normalizedMessage.includes(
        "forbidden",
      )
    ) {
      return createErrorResponse(
        "The Hugging Face token is invalid or does not have Inference Providers permission.",
        401,
      );
    }

    if (
      normalizedMessage.includes(
        "model",
      ) &&
      (
        normalizedMessage.includes(
          "not found",
        ) ||
        normalizedMessage.includes(
          "unsupported",
        )
      )
    ) {
      return createErrorResponse(
        "The selected Hugging Face image model is unavailable through the configured provider.",
        400,
      );
    }

    return createErrorResponse(
      process.env.NODE_ENV ===
        "development" &&
      providerMessage
        ? providerMessage
        : "The image could not be generated. Please try again later.",
      500,
    );
  }
}