import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY!;
const BASE_URL = 'https://api.neynar.com/v2/farcaster';

export async function getUserByFid(fid: number) {
  const { data } = await axios.get(`${BASE_URL}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
    headers: { 'x-api-key': API_KEY },
  });
  return data.users[0];
}

export async function getWallet(fid: number): Promise<string | null> {
  try {
    const user = await getUserByFid(fid);
    return user?.verified_addresses?.eth_addresses[0] || null;
  } catch (error) {
    console.error('Neynar fetch failed:', error);
    return null;
  }
}