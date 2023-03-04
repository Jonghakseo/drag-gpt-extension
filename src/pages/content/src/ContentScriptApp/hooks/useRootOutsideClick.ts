import { useEffect } from "react";
import { ROOT_ID } from "@pages/content/src/ContentScriptApp/constant/elementId";

type UseOutsideClickArgs = {
  ref: React.RefObject<HTMLElement>;
  handler: (event?: MouseEvent) => void;
};

export default function useRootOutsideClick({
  ref,
  handler,
}: UseOutsideClickArgs) {
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const root = ref.current.getRootNode();
    const onClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).id === ROOT_ID) {
        return;
      }
      if (root.contains(event.target as HTMLElement)) {
        return;
      }
      handler(event);
    };

    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [ref.current, handler]);
}
