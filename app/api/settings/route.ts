import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

type SettingsPayload = {
  site_title?: string;
  site_description?: string;
  email?: string;
  phone?: string;
  location?: string;
  availability_text?: string;
  linkedin_url?: string;
  github_url?: string;
  facebook_url?: string;
  copyright_text?: string;
};

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load settings.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: Request) {
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

    const body = (await request.json()) as SettingsPayload;

    const siteTitle = body.site_title?.trim();
    const siteDescription = body.site_description?.trim();
    const location = body.location?.trim();
    const availabilityText = body.availability_text?.trim();
    const copyrightText = body.copyright_text?.trim();

    if (
      !siteTitle ||
      !siteDescription ||
      !location ||
      !availabilityText ||
      !copyrightText
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Required settings fields cannot be empty.",
        },
        {
          status: 400,
        },
      );
    }

    const payload = {
      site_title: siteTitle,
      site_description: siteDescription,
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      location,
      availability_text: availabilityText,
      linkedin_url: body.linkedin_url?.trim() || null,
      github_url: body.github_url?.trim() || null,
      facebook_url: body.facebook_url?.trim() || null,
      copyright_text: copyrightText,
    };

    const { data: existingSettings, error: existingError } =
      await supabase
        .from("settings")
        .select("id")
        .limit(1)
        .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        {
          success: false,
          message: existingError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (existingSettings) {
      const { data, error } = await supabase
        .from("settings")
        .update(payload)
        .eq("id", existingSettings.id)
        .select("*")
        .single();

      if (error) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          {
            status: 500,
          },
        );
      }

      return NextResponse.json({
        success: true,
        data,
      });
    }

    const { data, error } = await supabase
      .from("settings")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to save settings.",
      },
      {
        status: 500,
      },
    );
  }
}