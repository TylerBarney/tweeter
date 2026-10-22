import { useState } from "react";
const useAsyncHook = () => {
  const [isLoading, setIsLoading] = useState(false);

  const doAsync = async (operation: () => Promise<void>) => {
    setIsLoading(() => true);
    try {
      await operation();
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, doAsync };
};

export default useAsyncHook;
