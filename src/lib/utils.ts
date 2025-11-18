export function validateWallet(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function generateMetadataUri(imageUri: string, username: string): string {
  const name = `Waitlist NFT for ${username}`;
  const desc = 'Farcaster Waitlist Reward NFT';
  return `ipfs://metadata-cid/${name}`;
}

export function getRemainingSupply(total: number): number {
  return 1000 - total;
}