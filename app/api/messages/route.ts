import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

type MessagePayload = {
  id?: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  is_read?: boolean;
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

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", {
        ascending: false,
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
            : "Unable to load messages.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = (await request.json()) as MessagePayload;

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const subject = body.subject?.trim();
    const message = body.message?.trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        {
          status: 400,
        },
      );
    }

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name must contain between 2 and 100 characters.",
        },
        {
          status: 400,
        },
      );
    }

    if (email.length < 5 || email.length > 254) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid email address.",
        },
        {
          status: 400,
        },
      );
    }

    if (subject.length < 2 || subject.length > 200) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subject must contain between 2 and 200 characters.",
        },
        {
          status: 400,
        },
      );
    }

    if (message.length < 5 || message.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message must contain between 5 and 5000 characters.",
        },
        {
          status: 400,
        },
      );
    }

    const { error } = await supabase
      .from("messages")
      .insert({
        name,
        email,
        subject,
        message,
        is_read: false,
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
      message: "Your message was sent successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to send your message.",
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

    const body = (await request.json()) as MessagePayload;

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Message ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const { data, error } = await supabase
      .from("messages")
      .update({
        is_read: Boolean(body.is_read),
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
            : "Unable to update the message.",
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

    const body = (await request.json()) as MessagePayload;

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Message ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const { error } = await supabase
      .from("messages")
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
            : "Unable to delete the message.",
      },
      {
        status: 500,
      },
    );
  }
}