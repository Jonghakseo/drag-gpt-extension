import { Spinner } from "@chakra-ui/react";
import { FC, Suspense } from "react";
import FontProvider from "@src/shared/component/FontProvider";
import OptionMainPage from "@pages/options/src/pages/Main";
import StyleProvider from "@src/shared/component/StyleProvider";

const App: FC = () => {
  return (
    <FontProvider>
      <StyleProvider isDark={true}>
        {/*  TODO router */}
        <Suspense fallback={<Spinner size="lg" m={8} />}>
          <OptionMainPage />
        </Suspense>
      </StyleProvider>
    </FontProvider>
  );
};

export default App;
