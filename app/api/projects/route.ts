import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

type ProjectPayload = {
  id?: string;
  title?: string;
  category?: string;
  description?: string;
  outcome?: string;
  image_url?: string;
  live_url?: string;
  source_url?: string;
  icon?: string;
  sort_order?: number;
  is_featured?: boolean;
  is_active?: boolean;
};

async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return {
    supabase,
    user: error ? null : user,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

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
      data: data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load projects.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();

    if (!user) {
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

    const body = (await request.json()) as ProjectPayload;

    const title = body.title?.trim();
    const category = body.category?.trim();
    const description = body.description?.trim();

    if (!title || !category || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, category, and description are required.",
        },
        {
          status: 400,
        },
      );
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        title,
        category,
        description,
        outcome: body.outcome?.trim() || null,
        image_url: body.image_url?.trim() || null,
        live_url: body.live_url?.trim() || null,
        source_url: body.source_url?.trim() || null,
        icon: body.icon?.trim() || "monitor",
        sort_order: Number(body.sort_order) || 0,
        is_featured: body.is_featured ?? true,
        is_active: body.is_active ?? true,
      })
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
            : "Unable to create project.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { supabase, user } = await requireUser();

    if (!user) {
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

    const body = (await request.json()) as ProjectPayload;

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Project ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const title = body.title?.trim();
    const category = body.category?.trim();
    const description = body.description?.trim();

    if (!title || !category || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, category, and description are required.",
        },
        {
          status: 400,
        },
      );
    }

    const { data, error } = await supabase
      .from("projects")
      .update({
        title,
        category,
        description,
        outcome: body.outcome?.trim() || null,
        image_url: body.image_url?.trim() || null,
        live_url: body.live_url?.trim() || null,
        source_url: body.source_url?.trim() || null,
        icon: body.icon?.trim() || "monitor",
        sort_order: Number(body.sort_order) || 0,
        is_featured: body.is_featured ?? true,
        is_active: body.is_active ?? true,
      })
      .eq("id", body.id)
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
            : "Unable to update project.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { supabase, user } = await requireUser();

    if (!user) {
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

    const body = (await request.json()) as ProjectPayload;

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Project ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", body.id);

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
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete project.",
      },
      {
        status: 500,
      },
    );
  }
}