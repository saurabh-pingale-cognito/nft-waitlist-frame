import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Providers } from '@/components/providers/WagmiProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NFT Waitlist Mini App',
  description: 'Join waitlist and mint NFT via Farcaster',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || '';
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="fc:miniapp" content={`{
          "version": "next",
          "imageUrl": "${baseUrl}/nft-logo.png",
          "button": {
            "title": "Join Waitlist",
            "action": {
              "type": "launch_miniapp",
              "name": "NFT Waitlist",
              "url": "${baseUrl}"
            }
          }
        }`} />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}