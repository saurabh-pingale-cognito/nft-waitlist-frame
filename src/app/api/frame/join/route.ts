import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

import { getUserByFid, getWallet } from '@/services/neynar';
import { dbConnect } from '@/lib/db';
import Waitlist from '@/lib/models/Waitlist';
import { validateWallet } from '@/lib/utils';
import { CONFIG } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationRes = await axios.post(`${CONFIG.NEYNAR_BASE_URL}/frame_actions/validate_frame_action`, { frame_action: body }, {
      headers: { 'api_key': CONFIG.NEYNAR_API_KEY, 'Content-Type': 'application/json' },
    });
    if (!validationRes.data.valid) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html><head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${CONFIG.APP_URL}/error.png" /> <!-- Fixed: APP_URL -->
          <meta property="fc:frame:button:1" content="Try Again" />
          <meta property="fc:frame:button:1:action" content="post" />
          <meta property="fc:frame:button:1:target" content="/api/frame/join" />
        </head></html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    await dbConnect();
    const { untrusted_fid: fid } = body;
    if (!fid) {
      return errorResponse('Invalid FID');
    }
    const wallet = await getWallet(fid);
    if (!wallet || !validateWallet(wallet)) {
      return errorResponse('No verified wallet found. Verify ETH address in Warpcast Settings > Verified Addresses.');
    }
    let user = await Waitlist.findOne({ wallet });
    if (user) {
      return alreadyJoinedResponse();
    }
    const neynarUser = await getUserByFid(fid);
    user = new Waitlist({
      wallet,
      fid,
      username: neynarUser.username,
      mintCount: 0
    });
    await user.save();
    return successResponse();
  } catch (error) {
    console.error('Frame join failed:', error);
    return errorResponse('Server error. Try again.');
  }
}

function errorResponse(message: string) {
  return new NextResponse(`
    <!DOCTYPE html>
    <html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${CONFIG.APP_URL}/error.png?text=${encodeURIComponent(message)}" />
      <meta property="fc:frame:button:1" content="Back to Home" />
      <meta property="fc:frame:button:1:action" content="link" />
      <meta property="fc:frame:button:1:target" content="${CONFIG.APP_URL}/" />
    </head></html>
  `, { headers: { 'Content-Type': 'text/html' } });
}

function alreadyJoinedResponse() {
  return new NextResponse(`
    <!DOCTYPE html>
    <html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${CONFIG.APP_URL}/already.png" />
      <meta property="fc:frame:button:1" content="Go to Mint" />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content="/api/frame/mint" />
    </head></html>
  `, { headers: { 'Content-Type': 'text/html' } });
}

function successResponse() {
  return new NextResponse(`
    <!DOCTYPE html>
    <html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${CONFIG.APP_URL}/success.png" />
      <meta property="fc:frame:button:1" content="Mint NFT" />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:1:target" content="/api/frame/mint" />
      <meta property="fc:frame:button:2" content="View Waitlist" />
      <meta property="fc:frame:button:2:action" content="link" />
      <meta property="fc:frame:button:2:target" content="${CONFIG.APP_URL}/waitlist" />
    </head></html>
  `, { headers: { 'Content-Type': 'text/html' } });
}