import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

type ServicePayload = {
  id?: string;
  title?: string;
  description?: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
};

async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      user: null,
    };
  }

  return {
    supabase,
    user,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("services")
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
            : "Unable to load services.",
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

    const body = (await request.json()) as ServicePayload;

    const title = body.title?.trim();
    const description = body.description?.trim();

    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and description are required.",
        },
        {
          status: 400,
        },
      );
    }

    const { data, error } = await supabase
      .from("services")
      .insert({
        title,
        description,
        icon: body.icon?.trim() || "globe",
        sort_order: Number(body.sort_order) || 0,
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
            : "Unable to create service.",
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

    const body = (await request.json()) as ServicePayload;

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Service ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const title = body.title?.trim();
    const description = body.description?.trim();

    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and description are required.",
        },
        {
          status: 400,
        },
      );
    }

    const { data, error } = await supabase
      .from("services")
      .update({
        title,
        description,
        icon: body.icon?.trim() || "globe",
        sort_order: Number(body.sort_order) || 0,
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
            : "Unable to update service.",
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

    const body = (await request.json()) as ServicePayload;

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Service ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const { error } = await supabase
      .from("services")
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
            : "Unable to delete service.",
      },
      {
        status: 500,
      },
    );
  }
}