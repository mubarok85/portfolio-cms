import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

const MAX_FILE_SIZE = 6 * 1024 * 1024;

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function sanitizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const formData = await request.formData();

    const fileValue = formData.get("file");
    const folderValue = formData.get("folder");

    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Select a file to upload.",
        },
        {
          status: 400,
        },
      );
    }

    if (!allowedTypes.has(fileValue.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG, WebP, and PDF files are allowed.",
        },
        {
          status: 400,
        },
      );
    }

    if (fileValue.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "The file must be smaller than 6 MB.",
        },
        {
          status: 400,
        },
      );
    }

    const folder =
      typeof folderValue === "string" &&
      folderValue.trim()
        ? sanitizeFilename(folderValue.trim())
        : "general";

    const safeFilename = sanitizeFilename(fileValue.name);

    const extension = safeFilename.includes(".")
      ? safeFilename.split(".").pop()
      : "";

    const baseName = safeFilename.replace(
      /\.[^/.]+$/,
      "",
    );

    const filePath = `${folder}/${Date.now()}-${baseName}${
      extension ? `.${extension}` : ""
    }`;

    const fileBuffer = await fileValue.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("portfolio-assets")
      .upload(filePath, fileBuffer, {
        contentType: fileValue.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          success: false,
          message: uploadError.message,
        },
        {
          status: 500,
        },
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("portfolio-assets")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      data: {
        path: filePath,
        url: publicUrlData.publicUrl,
        type: fileValue.type,
        name: fileValue.name,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to upload the file.",
      },
      {
        status: 500,
      },
    );
  }
}