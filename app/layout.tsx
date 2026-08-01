import type { Metadata } from "next";
import {
  Manrope,
  Playfair_Display,
} from "next/font/google";
import Background from "./components/Background";
import SmoothScroll from "../components/SmoothScroll";
import WhatsAppChatbot from "../components/WhatsAppChatbot";
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
  title: "Mubarok Hossain",
  description:
    "Senior Sales Executive and International Client Communication Specialist.",
};

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