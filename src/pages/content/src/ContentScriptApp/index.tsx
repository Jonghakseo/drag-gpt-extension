import { createRoot } from "react-dom/client";
import App from "@src/pages/content/src/ContentScriptApp/App";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import {
  ROOT_ID,
  SHADOW_ROOT_ID,
} from "@pages/content/src/ContentScriptApp/constant/elementId";

refreshOnUpdate("pages/content/src/ContentScriptApp");

const root = document.createElement("div");
root.id = ROOT_ID;

document.body.append(root);

const renderIn = document.createElement("div");
renderIn.id = SHADOW_ROOT_ID;

const shadow = root.attachShadow({ mode: "open" });
shadow.appendChild(renderIn);

createRoot(renderIn).render(<App />);
