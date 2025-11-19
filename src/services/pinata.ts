import { PinataSDK } from 'pinata';
import axios from 'axios';

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY!,
});

export async function uploadImage(url: string): Promise<string> {
  try {
    const { data: buffer } = await axios.get(url, { responseType: 'arraybuffer' });
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    const file = new File([blob], 'pfp.jpg', { type: 'image/jpeg' });
    const res = await pinata.upload.public.file(file);
    return `ipfs://${res.cid}`;
  } catch (error) {
    console.error('Pinata uploadImage error:', error);
    throw error;
  }
}

export async function uploadMetadata(name: string, desc: string, imageUri: string): Promise<string> {
  try {
    const metadata = { name, description: desc, image: imageUri };
    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const file = new File([blob], 'metadata.json', { type: 'application/json' });
    const res = await pinata.upload.public.file(file);
    return `ipfs://${res.cid}`;
  } catch (error) {
    console.error('Pinata uploadMetadata error:', error);
    throw error;
  }
}