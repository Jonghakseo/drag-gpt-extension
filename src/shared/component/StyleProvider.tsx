import { ReactNode } from "react";
import {
  ColorModeProvider,
  CSSReset,
  GlobalStyle,
  theme,
  ThemeProvider,
} from "@chakra-ui/react";

const colorModeManager = {
  type: "localStorage" as const,
  get: () => "dark" as const,
  set() {
    return;
  },
};

export default function StyleProvider({ children }: { children: ReactNode }) {
  return (
    <ColorModeProvider colorModeManager={colorModeManager}>
      <ThemeProvider theme={theme}>
        <CSSReset />
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </ColorModeProvider>
  );
}
