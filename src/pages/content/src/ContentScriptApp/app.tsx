import DragGPT from "@pages/content/src/ContentScriptApp/DragGPT";
import EmotionCacheProvider from "@pages/content/src/ContentScriptApp/emotion/EmotionCacheProvider";

export default function App() {
  return (
    <EmotionCacheProvider>
      <DragGPT />
    </EmotionCacheProvider>
  );
}
