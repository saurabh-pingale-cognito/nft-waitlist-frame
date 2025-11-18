import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

import { getUserByFid, getWallet } from '@/services/neynar';
import { uploadImage, uploadMetadata } from '@/services/pinata';
import { dbConnect } from '@/lib/db';
import Waitlist from '@/lib/models/Waitlist';
import { ABI } from '@/abi/NFTWaitlist.json';
import { validateWallet } from '@/lib/utils';

const RPC = process.env.BASE_SEPOLIA_RPC_URL!;
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY!;
const CONTRACT_ADDR = process.env.CONTRACT_ADDRESS!;

export async function POST(req: NextRequest) {
  if (process.env.MINT_PHASE !== 'true') {
    return NextResponse.json({error: 'Mint not live' }, { status: 403 });
  }

  try {
    await dbConnect();
    const { fid, wallet: providedWallet } = await req.json();

    const detectedWallet = await getWallet(fid);
    if (!validateWallet(providedWallet) || providedWallet !== detectedWallet) {
      return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 });
    }

    const user = await Waitlist.findOne({ wallet: providedWallet });
    if (!user || user.mintCount >= 2) {
      return NextResponse.json({
        error: 'Not on waitlist or mint limit reached (max 2 per wallet)' },
        { status: 400 }
      );
    }

    const neynarUser = await getUserByFid(fid);
    const imageUri = await uploadImage(neynarUser.pfp_url);
    const metadataUri = await uploadMetadata(`Waitlist NFT for ${neynarUser.username}`, 'Farcaster reward', imageUri);

    const provider = new ethers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDR, ABI, wallet);
    const tx = await contract.safeMint(providedWallet, metadataUri);
    await tx.wait();

    user.mintCount += 1;
    await user.save();

    return NextResponse.json({
      success: true,
      tokenId: await contract.totalSupply() - 1,
      metadataUri,
      remainingMints: 2 - user.mintCount
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Mint failed' }, { status: 500 });
  }
}