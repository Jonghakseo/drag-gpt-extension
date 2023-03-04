import Chrome from "chrome";

declare namespace chrome {
  export default Chrome;
}

declare module "virtual:reload-on-update-in-background-script" {
  export const reloadOnUpdate: (watchPath: string) => void;
  export default reloadOnUpdate;
}

declare module "virtual:reload-on-update-in-view" {
  const refreshOnUpdate: (watchPath: string) => void;
  export default refreshOnUpdate;
}

declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.json" {
  const content: string;
  export default content;
}

declare global {
  type ErrorMessageType = "GPTResponseError" | "Error";
  type CommonMessageType =
    | "RequestSelectionMessage"
    | "GPTResponse"
    | "SaveAPIKey"
    | "SetAssistantPrompt"
    | "SetRole"
    | "Response";

  type ActionMessageType =
    | "LoadAPIKey"
    | "ResetAPIKey"
    | "GetAssistantPrompt"
    | "GetRole";

  type MessageType = ErrorMessageType | CommonMessageType | ActionMessageType;

  type Message =
    | { type: CommonMessageType; data: string }
    | { type: ActionMessageType; data?: null }
    | { type: ErrorMessageType; data: Error };
}
