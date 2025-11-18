import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import axios from 'axios';

import { getUserByFid, getWallet } from '@/services/neynar';
import { uploadImage, uploadMetadata } from '@/services/pinata';
import { dbConnect } from '@/lib/db';
import Waitlist from '@/lib/models/Waitlist';
import { ABI } from '@/abi/NFTWaitlist.json';
import { validateWallet } from '@/lib/utils';
import { CONFIG } from '@/lib/config';

export async function POST(req: NextRequest) {
  if (process.env.MINT_PHASE !== 'true') {
    return errorResponse('Mint not live');
  }

  try {
    const body = await req.json();
    const validationRes = await axios.post(`${CONFIG.NEYNAR_BASE_URL}/frame_actions/validate_frame_action`, { frame_action: body }, {
      headers: { 'api_key': CONFIG.NEYNAR_API_KEY, 'Content-Type': 'application/json' },
    });
    if (!validationRes.data.valid) {
      return errorResponse('Invalid request');
    }

    await dbConnect();
    const { untrusted_fid: fid } = body;
    if (!fid) {
      return errorResponse('Invalid FID');
    }
    const wallet = await getWallet(fid);
    if (!validateWallet(wallet!)) {
      return errorResponse('Invalid wallet');
    }
    const user = await Waitlist.findOne({ wallet });
    if (!user || user.mintCount >= 2) {
      return errorResponse('Not on waitlist or mint limit reached (max 2 per wallet)');
    }
    const neynarUser = await getUserByFid(fid);
    const imageUri = await uploadImage(neynarUser.pfp_url);
    const metadataUri = await uploadMetadata(`Waitlist NFT for ${neynarUser.username}`, 'Farcaster reward', imageUri);
    const provider = new ethers.JsonRpcProvider(CONFIG.BASE_SEPOLIA_RPC_URL);
    const signer = new ethers.Wallet(CONFIG.DEPLOYER_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.safeMint(wallet, metadataUri);
    await tx.wait();
    user.mintCount += 1;
    await user.save();
    const imageSrc = metadataUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
    return mintSuccessResponse(imageSrc);
  } catch (error) {
    console.error('Frame mint failed:', error);
    return errorResponse('Mint failed');
  }
}

function errorResponse(message: string) {
  return new NextResponse(`
    <!DOCTYPE html>
    <html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${CONFIG.APP_URL}/error.png?text=${encodeURIComponent(message)}" />
      <meta property="fc:frame:button:1" content="Back" />
      <meta property="fc:frame:button:1:action" content="link" />
      <meta property="fc:frame:button:1:target" content="${CONFIG.APP_URL}/" />
    </head></html>
  `, { headers: { 'Content-Type': 'text/html' } });
}

function mintSuccessResponse(imageSrc: string) {
  return new NextResponse(`
    <!DOCTYPE html>
    <html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${imageSrc}" />
      <meta property="fc:frame:button:1" content="View on BaseScan" />
      <meta property="fc:frame:button:1:action" content="link" />
      <meta property="fc:frame:button:1:target" content="https://sepolia.basescan.org/" />
      <meta property="fc:frame:button:2" content="Mint Again (if available)" />
      <meta property="fc:frame:button:2:action" content="post" />
      <meta property="fc:frame:button:2:target" content="/api/frame/mint" />
    </head></html>
  `, { headers: { 'Content-Type': 'text/html' } });
}