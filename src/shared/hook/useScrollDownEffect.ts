import { DependencyList, useEffect, useRef } from "react";

export function useScrollDownEffect(deps?: DependencyList) {
  const scrollDownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollDownRef.current) {
      return;
    }
    scrollDownRef.current.scrollTo({
      top: scrollDownRef.current.scrollHeight,
    });
  }, deps);

  return { scrollDownRef };
}
