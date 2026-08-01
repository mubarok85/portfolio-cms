import type { Metadata } from "next";
import {
  Manrope,
  Playfair_Display,
} from "next/font/google";
import Background from "./components/Background";
import SmoothScroll from "../components/SmoothScroll";
import WhatsAppChatbot from "../components/WhatsAppChatbot";
import { createClient } from "../lib/supabase/server";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

type SettingsMetadata = {
  site_title?: string | null;
  site_description?: string | null;
  navbar_image_url?: string | null;
  favicon_url?: string | null;
};

async function getSettingsMetadata(): Promise<SettingsMetadata | null> {
  try {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("settings")
        .select(
          "site_title, site_description, navbar_image_url, favicon_url",
        )
        .limit(1)
        .maybeSingle();

    if (error) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings =
    await getSettingsMetadata();

  const title =
    settings?.site_title?.trim() ||
    "Mubarok Hossain";

  const description =
    settings?.site_description?.trim() ||
    "Senior Sales Executive and International Client Communication Specialist.";

  const favicon =
    settings?.favicon_url?.trim() ||
    settings?.navbar_image_url?.trim() ||
    "/profile.webp";

  return {
    title,
    description,

    icons: {
      icon: [
        {
          url: favicon,
        },
      ],

      shortcut: [
        {
          url: favicon,
        },
      ],

      apple: [
        {
          url: favicon,
        },
      ],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="overflow-x-hidden"
    >
      <body
        className={`${manrope.variable} ${playfair.variable} overflow-x-hidden`}
        style={{
          position: "relative",
          minHeight: "100vh",
          background: "#03050d",
        }}
      >
        <Background />

        <SmoothScroll>
          <div
            style={{
              position: "relative",
              zIndex: 10,
              minHeight: "100vh",
              width: "100%",
              overflowX: "hidden",
            }}
          >
            {children}
          </div>
        </SmoothScroll>

        <WhatsAppChatbot />
      </body>
    </html>
  );
}