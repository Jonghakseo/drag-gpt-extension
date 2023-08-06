import { useRef } from "react";
import generateId from "@src/shared/utils/generateId";

export default function useGeneratedId() {
  const idRef = useRef(generateId());

  const regenerate = () => {
    idRef.current = generateId();
  };

  return {
    id: idRef.current,
    regenerate,
  };
}
