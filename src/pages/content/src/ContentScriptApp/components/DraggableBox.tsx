import Draggable from "react-draggable";
import { ReactNode } from "react";

type DraggableBoxProps = {
  defaultX: number;
  defaultY: number;
  children: ReactNode;
};

export default function DraggableBox({
  defaultY,
  defaultX,
  children,
}: DraggableBoxProps) {
  return (
    <Draggable
      handle={`.${HANDLE_CLASS_NAME}`}
      defaultPosition={{ x: defaultX, y: defaultY }}
    >
      {children}
    </Draggable>
  );
}

const HANDLE_CLASS_NAME = "_drag_gpt_handle";
