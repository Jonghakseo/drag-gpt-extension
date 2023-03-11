import { useEffect, RefObject } from "react";
import { ROOT_ID } from "@pages/content/src/ContentScriptApp/constant/elementId";

type UseOutsideClickArgs = {
  ref: RefObject<HTMLElement>;
  handler: (event?: MouseEvent) => void;
  isDisabled?: boolean;
};

export default function useRootOutsideClick({
  ref,
  handler,
  isDisabled,
}: UseOutsideClickArgs) {
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const root = ref.current.getRootNode();
    const onClick = (event: MouseEvent) => {
      if (isDisabled) {
        return;
      }
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
  }, [ref.current, handler, isDisabled]);
}
