import { ReactNode } from "react";
import {
  ColorModeProvider,
  CSSReset,
  GlobalStyle,
  theme,
  ThemeProvider,
} from "@chakra-ui/react";

export default function StyleProvider({
  children,
  isDark,
}: {
  children: ReactNode;
  isDark: boolean;
}) {
  return (
    <ColorModeProvider
      colorModeManager={{
        type: "localStorage" as const,
        get: () => (isDark ? "dark" : ("light" as const)),
        set() {
          return;
        },
      }}
    >
      <ThemeProvider theme={theme}>
        <CSSReset />
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </ColorModeProvider>
  );
}
