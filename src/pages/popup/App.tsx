import Popup from "@pages/popup/Popup";
import StyleProvider from "@src/shared/component/StyleProvider";

export default function App() {
  return (
    <StyleProvider isDark={false}>
      <Popup />
    </StyleProvider>
  );
}
