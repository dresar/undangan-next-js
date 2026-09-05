import type { Metadata } from 'next';
import Script from 'next/script';
import StyledComponentsRegistry from './registry';
import './globals.css';

export const metadata: Metadata = {
  title: 'Digital Invitation Builder',
  description: 'Create beautiful digital invitations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link href="/libs/aos.css" rel="stylesheet" />
        <link href="/libs/google-fonts.css" rel="stylesheet" />
      </head>
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        <Script src="/libs/gsap.min.js" strategy="afterInteractive" />
        <Script src="/libs/aos.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

