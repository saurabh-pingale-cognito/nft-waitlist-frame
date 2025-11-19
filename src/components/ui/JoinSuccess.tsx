'use client';

import { useEffect, useState } from 'react';
import { useFrameContext } from '@/context/FrameContext';

export default function JoinSuccess() {
  const { dispatch } = useFrameContext();
  const [timer, setTimer] = useState(5);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/checkmark-green.png';
    img.onload = () => {
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error('Failed to load checkmark image');
      setImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          dispatch({ type: 'SET_SCREEN', payload: 'mint' });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="miniapp-container bg-gradient-to-b from-green-900/20 to-black rounded-lg shadow-xl flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
      <div className="flex flex-col items-center space-y-3">
        <img 
          src="/checkmark-green.png" 
          alt="Success" 
          className={`w-16 h-16 rounded-full shadow-lg animate-bounce ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={{ transition: 'opacity 0.3s ease-in-out' }}
        />
        <p className="text-center text-lg font-semibold text-green-400">Joined waitlist successfully!</p>
        <div className="text-center text-xs text-gray-300 bg-gray-800/50 px-3 py-1 rounded-full">
          Redirecting in {timer}s...
        </div>
      </div>
    </div>
  );
}