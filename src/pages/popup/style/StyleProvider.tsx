import { ReactNode } from "react";
import {
  CSSReset,
  GlobalStyle,
  LightMode,
  theme,
  ThemeProvider,
} from "@chakra-ui/react";

export default function StyleProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CSSReset />
      <GlobalStyle />
      <LightMode>{children}</LightMode>
    </ThemeProvider>
  );
}
