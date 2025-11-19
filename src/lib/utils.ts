export function validateWallet(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function getRemainingSupply(total: number): number {
  return 1000 - total;
}