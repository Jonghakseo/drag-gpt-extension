import createCache from "@emotion/cache";
import { ReactNode, useEffect, useRef, useState } from "react";
import { CacheProvider, EmotionCache } from "@emotion/react";
import { ROOT_ID } from "@pages/content/src/ContentScriptApp/constant/elementId";

export default function EmotionCacheProvider({
  children,
}: {
  children: ReactNode;
}) {
  const shadowRootRef = useRef<HTMLDivElement>(null);
  const [emotionCache, setEmotionCache] = useState<EmotionCache>();

  useEffect(() => {
    const root = document.getElementById(ROOT_ID);
    if (root && root.shadowRoot) {
      setEmotionStyles(root);
    }
  }, [shadowRootRef.current?.shadowRoot]);

  function setEmotionStyles(ref: HTMLElement) {
    if (!ref?.shadowRoot) {
      return;
    }

    if (ref && !emotionCache) {
      const createdInflabEmotionWithRef = createCache({
        key: "drag-gpt-key",
        container: ref.shadowRoot,
      });

      setEmotionCache(createdInflabEmotionWithRef);
    }
  }

  return (
    <div id="root" ref={shadowRootRef}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap"
        rel="stylesheet"
      />
      {emotionCache && (
        <CacheProvider value={emotionCache}>{children}</CacheProvider>
      )}
    </div>
  );
}
