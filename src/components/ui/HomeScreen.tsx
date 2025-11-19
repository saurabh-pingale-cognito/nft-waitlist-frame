'use client';

import { useState, useEffect, useRef } from 'react';

import { useFrameContext } from '@/context/FrameContext';
import { useFrameApi } from '@/hooks/useFrameApi';
import { getWallet } from '@/services/neynar';
import { Spinner } from './Spinner';
import { validateWallet } from '@/lib/utils';

export default function HomeScreen() {
  const { state, dispatch } = useFrameContext();
  const { joinWaitlist } = useFrameApi();

  const [wallet, setWallet] = useState(state.wallet);
  const [detectLoading, setDetectLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const detect = async () => {
    if (state.fid === 0) {
      setDetectLoading(false);
      return;
    }
    setDetectLoading(true);
    try {
      const detectedWallet = await getWallet(state.fid);
      if (detectedWallet) {
        setWallet((prev) => {
          if(prev === '' || prev === state.wallet) {
            dispatch({ type: 'SET_WALLET', payload: detectedWallet });
            return detectedWallet;
          }
          return prev;
        });
      }
    } catch (e) {
      console.error('Detect failed', e);
    } finally {
      setDetectLoading(false);
    }
  };
  
  useEffect(() => {
    detect();
  }, [state.fid]);

  useEffect(() => {
    if (state.wallet && wallet === '') {
      setWallet(state.wallet);
    }
  }, [state.wallet]);

  useEffect(() => {
    if (inputRef.current && wallet !== '') {
      inputRef.current.setSelectionRange(wallet.length, wallet.length);
    }
  }, [wallet]);

  useEffect(() => {
    if (state.error) {
      const timeout = setTimeout(() => {
        dispatch({ type: 'SET_ERROR', payload: null });
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [state.error, dispatch]);

  const handleJoin = async () => {
    if (!wallet || !validateWallet(wallet)) {
      dispatch({ type: 'SET_ERROR', payload: 'Invalid wallet address' });
      return;
    }

    setJoinLoading(true);
    try {
      await joinWaitlist(wallet);
    } catch (error) {
      console.error('Join waitlist failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to join waitlist' });
    } finally {
      setJoinLoading(false);
    }
  };

  const isButtonDisabled = detectLoading || joinLoading || !wallet || !validateWallet(wallet);

  const placeholderText = state.fid === 0 
    ? 'Open in Farcaster app to detect wallet (verify ETH in profile)' 
    : detectLoading 
    ? 'Detecting wallet...' 
    : !wallet 
    ? 'No wallet detected' 
    : '';

  return (
    <div className="miniapp-container bg-gradient-to-b from-gray-900 to-black rounded-lg shadow-xl flex flex-col items-center justify-center space-y-2 max-w-md mx-auto p-2">
      <div className="flex flex-col items-center w-full space-y-2">
        {state.error && (
          <div className="w-full p-2 bg-red-900/80 border border-red-500 rounded text-red-200 text-center text-xs font-medium animate-fade-in">
            {state.error}
          </div>
        )}
        <img 
          src="/nft-logo.png" 
          alt="NFT Logo" 
          className="w-20 h-20 rounded-full shadow-lg border-2 border-blue-500" 
        />
        <div className="w-full">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder={placeholderText}
              className="w-full bg-gray-800/50 backdrop-blur-sm p-2 pr-8 rounded text-center text-sm border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-70"
              autoFocus
            />
            {detectLoading && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Spinner size="sm" />
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={handleJoin} 
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 py-2 rounded font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 text-white"
          disabled={isButtonDisabled}
        >
          {joinLoading ? (
            <>
              <Spinner size="sm" />
              <span>Joining...</span>
            </>
          ) : (
            'Join Waitlist'
          )}
        </button>
      </div>
    </div>
  );
}