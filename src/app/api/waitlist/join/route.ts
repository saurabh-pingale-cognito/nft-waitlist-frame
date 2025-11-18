import { NextRequest, NextResponse } from 'next/server';

import { getUserByFid, getWallet } from '@/services/neynar';
import { dbConnect } from '@/lib/db';
import Waitlist from '@/lib/models/Waitlist';
import { validateWallet } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { fid } = await req.json();
    const wallet = await getWallet(fid);
    if (!wallet || !validateWallet(wallet)) {
      return NextResponse.json({ error: 'No verified wallet found' }, { status: 400 });
    }

    let user = await Waitlist.findOne({ wallet });
    if (user) {
      return NextResponse.json({ success: true, message: 'Already on waitlist' });
    }

    const neynarUser = await getUserByFid(fid);
    user = new Waitlist({
      wallet,
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