import { NextRequest, NextResponse } from 'next/server';

import { getUserByFid, getWallet } from '@/services/neynar';
import { dbConnect } from '@/lib/db';
import Waitlist from '@/lib/models/Waitlist';
import { validateWallet } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { fid, wallet: providedWallet } = await req.json();
    let finalWallet: string;

    if (providedWallet && validateWallet(providedWallet)) {
      finalWallet = providedWallet;
    } else {
      const tempWallet = await getWallet(fid);
      if (!tempWallet || !validateWallet(tempWallet)) {
        return NextResponse.json({ error: 'No verified wallet found and no address provided' }, { status: 400 });
      }
      finalWallet = tempWallet;
    }

    let user = await Waitlist.findOne({ wallet: finalWallet });
    if (user) {
      return NextResponse.json({ success: true, message: 'Address already on waitlist' });
    }

    const neynarUser = await getUserByFid(fid);
    user = new Waitlist({
      wallet: finalWallet,
      fid,
      username: neynarUser.username,
      mintCount: 0
    });
    await user.save();

    return NextResponse.json({ success: true, message: 'Joined waitlist' });
  } catch (error) {
    console.error('Failed to join to waitlist:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}