import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import Background from "./components/Background";
import CustomCursor from "../components/CustomCursor";
import SmoothScroll from "../components/SmoothScroll";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Mobarok Hossain",
  description:
    "Senior Sales Executive and International Client Communication Specialist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${playfair.variable}`}
        style={{
          position: "relative",
          minHeight: "100vh",
          background: "#03050d",
        }}
      >
        <Background />
        <CustomCursor />

        <SmoothScroll>
          <div
            style={{
              position: "relative",
              zIndex: 10,
              minHeight: "100vh",
            }}
          >
            {children}
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}