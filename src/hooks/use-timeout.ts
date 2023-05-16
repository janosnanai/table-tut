import { useEffect, useRef, useState, type MutableRefObject } from "react";

export function useTimeout(callback: () => void, delay = 300) {
  const [timer, setTimer] = useState<number | null>(null);
  const callbackRef: MutableRefObject<() => void> = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  function startTimeout() {
    stopTimeout();
    const newTimer = setTimeout(() => {
      callbackRef.current();
      setTimer(null);
    }, delay);
    setTimer(newTimer);
  }
  function stopTimeout() {
    if (!timer) return;
    clearTimeout(timer);
    setTimer(null);
  }

  return { startTimeout, stopTimeout, isActive: !!timer };
}
