'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { baseSepolia } from 'viem/chains';

import { useFrameContext } from '@/context/FrameContext';
import { useFrameApi } from '@/hooks/useFrameApi';
import { Spinner } from './Spinner';
import { ABI } from '@/abi/NFTWaitlist.json';
import { getRemainingSupply, validateWallet } from '@/lib/utils';

export default function MintScreen() {
  const { state, dispatch } = useFrameContext();
  const { mintNft } = useFrameApi();

  const [wallet, setWallet] = useState(state.wallet);
  const [mintLoading, setMintLoading] = useState(false);
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    setWallet(state.wallet);
    setInputError('');
  }, [state.wallet]);

  useEffect(() => {
    if (state.error) {
      const timeout = setTimeout(() => {
        dispatch({ type: 'SET_ERROR', payload: null });
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [state.error, dispatch]);

  useEffect(() => {
    if (wallet && wallet !== state.wallet) {
      setInputError('This address is not in the waitlist. Provide an address that is in the waitlist.');
    } else {
      setInputError('');
    }
  }, [wallet, state.wallet]);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const enabled = !!contractAddress;

  const { data: totalSupply } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: ABI,
    functionName: 'totalSupply',
    chainId: baseSepolia.id,
    query: {
      enabled
    }
  });

  const remaining = getRemainingSupply(Number(totalSupply ?? BigInt(0)));

  const handleMint = async () => {
    if (!validateWallet(wallet)) {
      dispatch({ type: 'SET_ERROR', payload: 'Invalid wallet address' });
      return;
    }
    if (inputError) {
      dispatch({ type: 'SET_ERROR', payload: inputError });
      return;
    }
    setMintLoading(true);
    try {
      await mintNft(wallet);
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Mint failed' });
    } finally {
      setMintLoading(false);
    }
  };

  return (
    <div className="miniapp-container bg-gradient-to-b from-purple-900/20 to-black rounded-lg shadow-xl flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
      <div className="flex flex-col items-center w-full space-y-4">
        {state.error && (
          <div className="w-full p-2 bg-red-900/80 border border-red-500 rounded text-red-200 text-center text-xs font-medium animate-fade-in">
            {state.error}
          </div>
        )}
        {inputError && (
          <div className="w-full p-2 bg-yellow-900/80 border border-yellow-500 rounded text-yellow-200 text-center text-xs font-medium animate-fade-in">
            {inputError}
          </div>
        )}
        <img 
          src="/nft-logo.png" 
          alt="Mint" 
          className="w-24 h-24 rounded-full shadow-lg border-2 border-purple-500" 
        />
        <input
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          className="w-full bg-gray-800/50 backdrop-blur-sm p-2 rounded text-center text-sm border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          autoFocus
          placeholder="Detected wallet (verified in Farcaster)"
        />
        <p className="text-gray-300 font-semibold text-sm">Remaining Supply: {remaining}</p>
        <button 
          onClick={handleMint} 
          disabled={mintLoading || remaining === 0 || !wallet.trim()}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 py-2 rounded font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
        >
          {mintLoading && <Spinner size="sm" />}
          <span>{mintLoading ? 'Minting...' : 'Mint Now'}</span>
        </button>
        {remaining === 0 && <p className="text-red-400 text-xs">Supply exhausted!</p>}
      </div>
    </div>
  );
}