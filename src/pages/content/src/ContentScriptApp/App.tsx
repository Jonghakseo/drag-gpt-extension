import DragGPT from "@pages/content/src/ContentScriptApp/DragGPT";
import EmotionCacheProvider from "@pages/content/src/ContentScriptApp/emotion/EmotionCacheProvider";
import ResetStyleProvider from "@pages/content/src/ContentScriptApp/emotion/ResetStyleProvider";
import FontProvider from "@pages/content/src/ContentScriptApp/emotion/FontProvider";
import { CSSReset, theme, ThemeProvider } from "@chakra-ui/react";

theme.space;
export default function App() {
  return (
    <ResetStyleProvider>
      <FontProvider>
        <EmotionCacheProvider>
          <ThemeProvider
            theme={{
              ...theme,
              fontSizes: {
                ...theme.fontSizes,
                sm: "14px",
                xs: "12px",
              },
              sizes: {
                ...theme.sizes,
                6: "24px",
                8: "32px",
              },
            }}
          >
            <CSSReset />
            <DragGPT />
          </ThemeProvider>
        </EmotionCacheProvider>
      </FontProvider>
    </ResetStyleProvider>
  );
}
