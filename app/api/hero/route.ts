import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("hero")
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
            : "Unable to load hero content.",
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

    const body = await request.json();

    const {
      badge_text,
      title,
      highlighted_title,
      description,
      primary_button_text,
      primary_button_url,
      secondary_button_text,
      resume_url,
      profile_image_url,
      clients_supported,
      countries_reached,
      years_experience,
      is_available,
    } = body;

    const { data: existingHero, error: existingHeroError } =
      await supabase
        .from("hero")
        .select("id")
        .limit(1)
        .maybeSingle();

    if (existingHeroError) {
      return NextResponse.json(
        {
          success: false,
          message: existingHeroError.message,
        },
        {
          status: 500,
        },
      );
    }

    const heroPayload = {
      badge_text,
      title,
      highlighted_title,
      description,
      primary_button_text,
      primary_button_url,
      secondary_button_text,
      resume_url: resume_url || null,
      profile_image_url: profile_image_url || null,
      clients_supported: Number(clients_supported),
      countries_reached: Number(countries_reached),
      years_experience: Number(years_experience),
      is_available: Boolean(is_available),
    };

    if (existingHero) {
      const { data, error } = await supabase
        .from("hero")
        .update(heroPayload)
        .eq("id", existingHero.id)
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
      .from("hero")
      .insert(heroPayload)
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
            : "Unable to update hero content.",
      },
      {
        status: 500,
      },
    );
  }
}