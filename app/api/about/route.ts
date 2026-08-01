import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("about")
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
            : "Unable to load About content.",
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
      heading,
      paragraph_one,
      paragraph_two,
      paragraph_three,
      skills,
      image_url,
    } = body;

    const { data: existingAbout, error: existingError } =
      await supabase
        .from("about")
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

    const payload = {
      heading,
      paragraph_one,
      paragraph_two,
      paragraph_three,
      skills: Array.isArray(skills) ? skills : [],
      image_url: image_url || null,
    };

    if (existingAbout) {
      const { data, error } = await supabase
        .from("about")
        .update(payload)
        .eq("id", existingAbout.id)
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
      .from("about")
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
            : "Unable to update About content.",
      },
      {
        status: 500,
      },
    );
  }
}