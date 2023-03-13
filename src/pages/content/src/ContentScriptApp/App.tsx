import DragGPT from "@pages/content/src/ContentScriptApp/DragGPT";
import EmotionCacheProvider from "@pages/content/src/ContentScriptApp/emotion/EmotionCacheProvider";
import ResetStyleProvider from "@pages/content/src/ContentScriptApp/emotion/ResetStyleProvider";
import FontProvider from "@pages/content/src/ContentScriptApp/emotion/FontProvider";

export default function App() {
  return (
    <ResetStyleProvider>
      <FontProvider>
        <EmotionCacheProvider>
          <DragGPT />
        </EmotionCacheProvider>
      </FontProvider>
    </ResetStyleProvider>
  );
}
