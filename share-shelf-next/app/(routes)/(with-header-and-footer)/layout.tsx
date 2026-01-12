import { Navbar } from "@/app/Components";
import "../globals.css";

export default function WithHeaderAndFooterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
