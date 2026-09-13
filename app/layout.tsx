import type { Metadata, Viewport } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Trading OS · Accountability Agent",
  description:
    "The discipline layer for XAUUSD execution. Evidence-led trading accountability — process before P&L, never prediction."
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  colorScheme: "dark"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
