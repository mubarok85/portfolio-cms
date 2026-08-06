import { createClient } from "../../../lib/supabase/server";
import type {
  PortfolioContext,
  PortfolioRecord,
} from "./types";

function cleanDatabaseValue(
  value: PortfolioRecord,
): PortfolioRecord {
  if (!value) {
    return null;
  }

  if (
    Array.isArray(value)
  ) {
    return value
      .slice(0, 12)
      .map((item) => {
        const {
          created_at,
          updated_at,
          ...publicItem
        } = item;

        void created_at;
        void updated_at;

        return publicItem;
      });
  }

  const {
    created_at,
    updated_at,
    ...publicValue
  } = value;

  void created_at;
  void updated_at;

  return publicValue;
}

export async function getPortfolioContext(): Promise<PortfolioContext> {
  const supabase =
    await createClient();

  const [
    settingsResult,
    heroResult,
    aboutResult,
    servicesResult,
    experienceResult,
    projectsResult,
  ] = await Promise.all([
    supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle(),

    supabase
      .from("hero")
      .select("*")
      .limit(1)
      .maybeSingle(),

    supabase
      .from("about")
      .select("*")
      .limit(1)
      .maybeSingle(),

    supabase
      .from("services")
      .select("*")
      .eq(
        "is_active",
        true,
      )
      .order(
        "sort_order",
        {
          ascending: true,
        },
      )
      .limit(12),

    supabase
      .from("experience")
      .select("*")
      .eq(
        "is_active",
        true,
      )
      .order(
        "sort_order",
        {
          ascending: true,
        },
      )
      .limit(12),

    supabase
      .from("projects")
      .select("*")
      .eq(
        "is_active",
        true,
      )
      .order(
        "sort_order",
        {
          ascending: true,
        },
      )
      .limit(12),
  ]);

  return {
    settings:
      cleanDatabaseValue(
        settingsResult.error
          ? null
          : settingsResult.data,
      ),

    hero:
      cleanDatabaseValue(
        heroResult.error
          ? null
          : heroResult.data,
      ),

    about:
      cleanDatabaseValue(
        aboutResult.error
          ? null
          : aboutResult.data,
      ),

    services:
      cleanDatabaseValue(
        servicesResult.error
          ? null
          : servicesResult.data,
      ),

    experience:
      cleanDatabaseValue(
        experienceResult.error
          ? null
          : experienceResult.data,
      ),

    projects:
      cleanDatabaseValue(
        projectsResult.error
          ? null
          : projectsResult.data,
      ),
  };
}