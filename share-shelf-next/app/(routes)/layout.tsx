import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthContextProvider } from "@/contexts";
import "swiper/css";

export const metadata: Metadata = {
  title: "Share Shelf",
  description: "Offical website of Share Shelf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <AuthContextProvider>
          {children}
          <Toaster />
        </AuthContextProvider>
      </body>
    </html>
  );
}
