function withValidProperties(properties: Record<string, undefined | string | string[]>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
  );
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_URL as string;
  const hostname = baseUrl ? new URL(baseUrl).hostname : '';
  
  return Response.json({
    "accountAssociation": {
      "header": "eyJmaWQiOjg1NTYzMiwidHlwZSI6ImF1dGgiLCJrZXkiOiIweEM2NThGNjc0NjQ0RmJBODg0ZTI3YjQ1YmVCQWU3Mjc0NUZBYWYzMjIifQ",
      "payload": "eyJkb21haW4iOiJuZnQtd2FpdGxpc3QtZnJhbWUudmVyY2VsLmFwcCJ9",
      "signature": "JhUa60wtL4YvKU5+vN1tglGWqvVevDVnI6eYFDMymBZ+Lo4tdIngOqY8XvEyQxQY4xwrPYebFZ8HUUuQqqqicRs="
    },
    "baseBuilder": {
      "ownerAddress": "0x"
    },
    "miniapp": {
      "version": "1",
      "name": "NFT Waitlist",
      "homeUrl": `${baseUrl}`,
      "iconUrl": `${baseUrl}/i.png`,
      "splashImageUrl": `${baseUrl}/l.png`,
      "splashBackgroundColor": "#000000",
      "webhookUrl": `${baseUrl}/api/webhook`,
      "subtitle": "Join and mint NFT rewards",
      "description": "Join the waitlist via Farcaster and mint your NFT on Base Sepolia.",
      "screenshotUrls": [
        `${baseUrl}/s1.png`,
        `${baseUrl}/s2.png`,
        `${baseUrl}/s3.png`
      ],
      "primaryCategory": "social",
      "tags": ["nft", "waitlist", "farcaster", "base"],
      "heroImageUrl": `${baseUrl}/home.jpg`,
      "tagline": "Farcaster NFT Rewards",
      "ogTitle": "NFT Waitlist Mini App",
      "ogDescription": "Join waitlist and mint NFT via Farcaster.",
      "ogImageUrl": `${baseUrl}/home.jpg`,
      "requiredChains": ["eip155:84532"],
      "canonicalDomain": hostname,
      "noindex": true
    }
  }); 
}