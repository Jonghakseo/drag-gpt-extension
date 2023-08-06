import { DependencyList, useEffect, useRef } from "react";

export function useScrollDownEffect(deps?: DependencyList) {
  const scrollDownRef = useRef<HTMLDivElement>(null);
  const isActivate = useRef(true);

  useEffect(() => {
    if (!scrollDownRef.current) {
      return;
    }
    if (!isActivate.current) {
      return;
    }
    scrollDownRef.current.scrollTo({
      top: scrollDownRef.current.scrollHeight,
    });
  }, deps);

  useEffect(() => {
    if (!scrollDownRef.current) {
      return;
    }
    let lastScroll = scrollDownRef.current.scrollTop;
    const onScroll = () => {
      if (!scrollDownRef.current) {
        return;
      }
      const isScrollDownNow = scrollDownRef.current.scrollTop > lastScroll;
      isScrollDownNow ? on() : off();
      lastScroll = scrollDownRef.current.scrollTop;
    };

    scrollDownRef.current.addEventListener("scroll", onScroll);

    return () => {
      scrollDownRef.current?.removeEventListener("scroll", onScroll);
    };
  }, []);

  const off = () => {
    isActivate.current = false;
  };

  const on = () => {
    isActivate.current = true;
  };

  return { scrollDownRef };
}
