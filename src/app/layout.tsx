import { Inter } from "next/font/google";
import { CONFIG } from '@/lib/config';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>NFT Waitlist Frame</title>
        <meta name="description" content="Join waitlist and mint NFT" />
        <meta property="og:title" content="NFT Waitlist Frame" />
        <meta property="og:description" content="Join waitlist and mint NFT" />
        <meta property="og:image" content={`${CONFIG.APP_URL}/home.jpg`} />
        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:post_url" content={`${CONFIG.APP_URL}/api/frame/join`} />
        <meta name="fc:frame:button:1" content="Join Waitlist" />
        <meta name="fc:frame:button:1:action" content="post" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}