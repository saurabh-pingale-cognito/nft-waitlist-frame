'use client';

import { useEffect, useState } from 'react';
import { useFrameContext } from '@/context/FrameContext';

export default function MintSuccess() {
  const { state } = useFrameContext();
  const [showConfetti, setShowConfetti] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (state.imageUri) {
      const img = new Image();
      img.src = state.imageUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
      img.onload = () => setImageLoaded(true);
      img.onerror = () => {
        setImageError(true);
        img.src = state.imageUri.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
        img.onload = () => {
          setImageLoaded(true);
          setImageError(false);
        };
      };
    }
  }, [state.imageUri]);

  let imageSrc = state.imageUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  if (imageError) {
    imageSrc = state.imageUri.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
  }

  return (
    <div className="miniapp-container bg-gradient-to-b from-emerald-900/20 to-black rounded-lg shadow-xl flex flex-col items-center justify-center gap-4 max-w-md mx-auto relative p-6">
      <div className="relative w-40 h-40 mb-6 rounded-2xl shadow-2xl border-4 border-green-500 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
            <span className="text-red-300 text-xs">Image load failed</span>
          </div>
        )}
        <img 
          src={imageSrc} 
          alt="Minted NFT" 
          loading="eager"
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      </div>
      <p className="text-center text-2xl font-bold text-green-400 mb-6">NFT Reward Minted! 🎉</p>
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:0ms]"></div>
          <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-red-400 rounded-full animate-bounce [animation-delay:100ms]"></div>
          <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:200ms]"></div>
        </div>
      )}
    </div>
  );
}