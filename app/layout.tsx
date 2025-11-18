import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Endpoint Tester',
  description: 'Test API endpoints',
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

