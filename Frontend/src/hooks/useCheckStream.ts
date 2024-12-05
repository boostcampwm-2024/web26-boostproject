import { useState, useCallback } from 'react';

const RETRY_COUNT = 5;
const RETRY_DELAY = 2000;

const fetchStream = async (url: string) => {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.error('Stream check failed:', error);
    return false;
  }
};

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

interface UseStreamCheckResult {
  isStreamReady: boolean;
  checkStreamAvailability: () => void;
}

const useStreamCheck = (streamUrl: string): UseStreamCheckResult => {
  const [isStreamReady, setIsStreamReady] = useState(false);

  const checkStreamAvailability = useCallback(async () => {
    for (let i = 0; i < RETRY_COUNT; i += 1) {
      const isAvailable = await fetchStream(streamUrl);

      if (isAvailable) {
        setIsStreamReady(true);
        return;
      }

      if (i < RETRY_COUNT - 1) {
        await delay(RETRY_DELAY);
      }
    }

    setIsStreamReady(false);
  }, [streamUrl]);

  return {
    isStreamReady,
    checkStreamAvailability,
  };
};

export default useStreamCheck;
