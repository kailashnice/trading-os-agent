import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Trading OS Coach",
  description: "Evidence-led trading accountability, not market prediction."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
