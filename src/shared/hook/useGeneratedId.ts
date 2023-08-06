import { useRef } from "react";
import generateId from "@src/shared/utils/generateId";

export default function useGeneratedId(prefix?: string) {
  const idRef = useRef(prefix + generateId());

  const regenerate = () => {
    idRef.current = generateId();
  };

  return {
    id: idRef.current,
    regenerate,
  };
}
