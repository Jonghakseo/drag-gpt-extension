import { ReactNode } from "react";
import { ThemeProvider, theme } from "@chakra-ui/react";

export default function StyleProvider({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
