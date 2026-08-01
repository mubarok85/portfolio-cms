import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

type ExperiencePayload = {
  id?: string;
  role?: string;
  company?: string;
  period?: string;
  description?: string;
  skills?: string[];
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

  return {
    supabase,
    user: error ? null : user,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("experience")
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
            : "Unable to load experience.",
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

    const body = (await request.json()) as ExperiencePayload;

    const role = body.role?.trim();
    const company = body.company?.trim();
    const period = body.period?.trim();
    const description = body.description?.trim();

    if (!role || !company || !period || !description) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Role, company, period, and description are required.",
        },
        {
          status: 400,
        },
      );
    }

    const { data, error } = await supabase
      .from("experience")
      .insert({
        role,
        company,
        period,
        description,
        skills: Array.isArray(body.skills) ? body.skills : [],
        icon: body.icon?.trim() || "briefcase",
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
            : "Unable to create experience.",
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

    const body = (await request.json()) as ExperiencePayload;

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Experience ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const role = body.role?.trim();
    const company = body.company?.trim();
    const period = body.period?.trim();
    const description = body.description?.trim();

    if (!role || !company || !period || !description) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Role, company, period, and description are required.",
        },
        {
          status: 400,
        },
      );
    }

    const { data, error } = await supabase
      .from("experience")
      .update({
        role,
        company,
        period,
        description,
        skills: Array.isArray(body.skills) ? body.skills : [],
        icon: body.icon?.trim() || "briefcase",
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
            : "Unable to update experience.",
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

    const body = (await request.json()) as ExperiencePayload;

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Experience ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const { error } = await supabase
      .from("experience")
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
            : "Unable to delete experience.",
      },
      {
        status: 500,
      },
    );
  }
}