'use client';

import { useEffect, useState } from 'react';
import { useFrameContext } from '@/context/FrameContext';

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default function MintSuccess() {
  const { state } = useFrameContext();
  const [showConfetti, setShowConfetti] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const handleCopy = async () => {
    if (!state.contractAddress) return;
    await navigator.clipboard.writeText(state.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  let imageSrc = state.imageUri ? state.imageUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : '';
  if (imageError && state.imageUri) {
    imageSrc = state.imageUri.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
  }

  return (
    <div className="miniapp-container bg-gradient-to-b from-emerald-900/20 to-black rounded-lg shadow-xl flex flex-col items-center justify-center gap-4 max-w-md mx-auto relative p-6 border border-emerald-900/30">
      
      {/* NFT Image Section */}
      <div className="relative w-40 h-40 mb-2 rounded-2xl shadow-2xl border-4 border-green-500 overflow-hidden bg-black">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
            <span className="text-red-300 text-xs">Image failed</span>
          </div>
        )}
        <img 
          src={imageSrc} 
          alt="Minted NFT" 
          className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      </div>

      <p className="text-center text-2xl font-bold text-green-400 mb-1">NFT Reward Minted! 🎉</p>

      {state.contractAddress && (
        <div className="w-full max-w-[300px] space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-wider text-center">NFT Contract Address</div>
          <div className="flex items-center gap-2 bg-black/40 border border-emerald-500/30 rounded-lg p-2 pr-3 transition-colors hover:border-emerald-500/50 group">
            <div className="flex-1 font-mono text-sm text-emerald-100 truncate px-2">
              {state.contractAddress}
            </div>
            <button
              onClick={handleCopy}
              className="text-emerald-400 hover:text-white transition-colors p-1 rounded hover:bg-emerald-500/20"
              title="Copy Address"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>
      )}

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