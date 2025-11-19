'use client';

import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { FrameProvider, useFrameContext } from '@/context/FrameContext';

import HomeScreen from '@/components/ui/HomeScreen';
import JoinSuccess from '@/components/ui/JoinSuccess';
import MintScreen from '@/components/ui/MintScreen';
import MintSuccess from '@/components/ui/MintSuccess';

function MiniAppContent() {
  const { state, dispatch } = useFrameContext();

  useEffect(() => {
    const init = async () => {
      await sdk.actions.ready();
      try {
        const context = sdk.context;
        const fid = (await context).user.fid || 0;
        dispatch({ type: 'SET_FID', payload: fid });
      } catch (error) {
        console.error('Failed to get context:', error);
      }
    };
    init();
  }, [dispatch]);

  const MiniAppScreens = {
    home: <HomeScreen />,
    success: <JoinSuccess />,
    mint: <MintScreen />,
    mintSuccess: <MintSuccess />,
  };

  return <div className="miniapp-container">{MiniAppScreens[state.screen]}</div>;
}

export default function MiniApp() {
  return (
    <FrameProvider>
      <MiniAppContent />
    </FrameProvider>
  );
}