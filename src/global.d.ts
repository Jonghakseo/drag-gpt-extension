import type Chrome from "chrome";
import type { ChatCompletionRequestMessage } from "openai";

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
  type ChatGPTSlot = {
    type: "ChatGPT";
    system?: string;
    /** config */
    maxTokens?: number; // max 4000
    temperature?: number; // 의외성 (0~1)
    topP?: number; // 단어 풀의 범위(0~1)
    frequencyPenalty?: number; // 자주 사용하는 단어 억제
    presencePenalty?: number; // 이미 사용된 단어 억제
  };

  type Slot = { id: string; name: string; isSelected: boolean } & ChatGPTSlot;

  type CommonMessageType =
    | "SelectSlot"
    | "DeleteSlot"
    | "RequestSelectionMessage"
    | "SaveAPIKey";
  type RequestMessageType = "GetAPIKey" | "GetSlots" | "ResetAPIKey";

  type ErrorResponseMessage = { type: "Error"; data: Error };
  type ResponseGPTMessage = {
    type: "ResponseGPT";
    data: { result: string; tokenUsage: number };
  };
  type ResponseSlotsMessage = {
    type: "ResponseSlots";
    data: Slot[];
  };
  type DoneResponseMessage =
    | {
        type: "Response";
        data: any;
      }
    | ResponseSlotsMessage
    | ResponseGPTMessage;
  type ResponseMessages = ErrorResponseMessage | DoneResponseMessage;

  type CommonMessages = { type: CommonMessageType; data: string };
  type RequestMessages = { type: RequestMessageType; data?: null };

  type Message =
    | {
        type: "GetSlots";
        data: Slot[];
      }
    | {
        type: "AddNewSlot" | "UpdateSlotData";
        data: Slot;
      }
    | {
        type: "RequestAdditionalChat";
        data: { input: string; histories: ChatCompletionRequestMessage[] };
      }
    | ResponseMessages
    | CommonMessages
    | RequestMessages;
}
