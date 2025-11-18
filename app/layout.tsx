import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HR Assistant",
  description: "A helpful assistant for HR managers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
