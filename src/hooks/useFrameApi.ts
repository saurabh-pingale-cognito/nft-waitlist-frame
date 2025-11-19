import { useFrameContext } from '@/context/FrameContext';

export function useFrameApi() {
  const { state, dispatch } = useFrameContext();

  const joinWaitlist = async (wallet: string) => {
    try {
      const res = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid: state.fid, wallet }),
      });
      if (!res.ok) {
        const data = await res.json();
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Join failed' });
        return;
      }
      dispatch({ type: 'SET_WALLET', payload: wallet });
      dispatch({ type: 'SET_SCREEN', payload: 'success' });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error. Please try again.' });
    }
  };

  const mintNft = async (wallet: string) => {
    const res = await fetch('/api/waitlist/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fid: state.fid, wallet }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Mint failed');
    }
    const { imageUri } = await res.json();
    dispatch({ type: 'SET_WALLET', payload: wallet });
    dispatch({ type: 'SET_IMAGE_URI', payload: imageUri });
    dispatch({ type: 'SET_SCREEN', payload: 'mintSuccess' });
  };

  return { joinWaitlist, mintNft };
}