import { ReactNode } from "react";
import { ThemeProvider, theme, ChakraProvider } from "@chakra-ui/react";

export default function StyleProvider({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ChakraProvider>
  );
}
