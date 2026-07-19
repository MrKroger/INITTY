import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const metadata: Metadata = {
  title: "Unity - Student Networking",
  description: "Find your community at university.",
};

function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
export { metadata };
export default RootLayout;