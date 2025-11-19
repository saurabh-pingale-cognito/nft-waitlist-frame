import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

import { getUserByFid } from '@/services/neynar';
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
    return NextResponse.json({ error: 'Mint not live' }, { status: 403 });
  }

  try {
    const { fid, wallet: providedWallet } = await req.json();

    await dbConnect();

    if (!providedWallet || !validateWallet(providedWallet)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    const user = await Waitlist.findOne({ wallet: providedWallet });
    
    if (!user) {
      return NextResponse.json(
        { error: 'This wallet is not on the waitlist. Please use the address you registered with.' },
        { status: 400 }
      );
    }

    if (user.mintCount >= 2) {
      return NextResponse.json(
        { error: 'Mint limit reached (max 2 per wallet)' },
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

    const finalTotalSupply = await contract.totalSupply();

    const response = {
      success: true,
      tokenId: (finalTotalSupply - BigInt(1)).toString(),
      imageUri,
      metadataUri, 
      remainingMints: 2 - user.mintCount
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Mint failed:', error);
    return NextResponse.json({ error: error.message || 'Mint failed' }, { status: 500 });
  }
}