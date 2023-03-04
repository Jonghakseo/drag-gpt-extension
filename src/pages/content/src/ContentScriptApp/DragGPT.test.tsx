import { render, screen } from "@testing-library/react";
import DragGPT from "@pages/content/src/ContentScriptApp/DragGPT";

describe("DragGPT Test", () => {
  test("render DragGPT", () => {
    // when
    render(<DragGPT />);
  });
});
