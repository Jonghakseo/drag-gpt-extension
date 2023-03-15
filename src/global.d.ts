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

  type Chat = {
    role: "user" | "assistant" | "error";
    content: string;
  };

  type AddNewSlotMessage = {
    type: "AddNewSlot";
    input: Slot;
    data?: "success";
  };
  type SelectSlotMessage = {
    type: "SelectSlot";
    input: string;
    data?: "success";
  };
  type UpdateSlotMessage = {
    type: "UpdateSlot";
    input: Slot;
    data?: "success";
  };
  type DeleteSlotMessage = {
    type: "DeleteSlot";
    input: string;
    data?: "success";
  };
  type RequestOnetimeChatGPTMessage = {
    type: "RequestOnetimeChatGPT";
    input: string;
    data?: { result: string; tokenUsage: number };
  };
  type RequestGenerateChatGPTPromptMessage = {
    type: "RequestGenerateChatGPTPrompt";
    input: string;
    data?: { result: string; tokenUsage: number };
  };
  type RequestOngoingChatGPTMessage = {
    type: "RequestOngoingChatGPT";
    input: ChatCompletionRequestMessage[];
    data?: { result: string; tokenUsage: number };
  };
  type RequestQuickChatGPTMessage = {
    type: "RequestQuickChatGPT";
    input?: ChatCompletionRequestMessage[];
    data?: { result: string; tokenUsage: number };
  };
  type SaveAPIKeyMessage = {
    type: "SaveAPIKey";
    input: string;
    data?: "success";
  };
  type ResetAPIKeyMessage = {
    type: "ResetAPIKey";
    input?: never;
    data?: "success";
  };
  type GetAPIKeyMessage = {
    type: "GetAPIKey";
    input?: never;
    data?: string;
  };
  type GetSlotsMessage = {
    type: "GetSlots";
    input?: never;
    data?: Slot[];
  };
  type GetQuickChatHistoryMessage = {
    type: "GetQuickChatHistory";
    input?: never;
    data?: Chat[];
  };
  type ResetQuickChatHistoryMessage = {
    type: "ResetQuickChatHistory";
    input?: never;
    data?: "success";
  };
  type ErrorMessage = {
    type: "Error";
    input?: never;
    error: Error;
  };

  type Message =
    | RequestQuickChatGPTMessage
    | RequestOngoingChatGPTMessage
    | ResetQuickChatHistoryMessage
    | GetQuickChatHistoryMessage
    | AddNewSlotMessage
    | UpdateSlotMessage
    | GetSlotsMessage
    | GetAPIKeyMessage
    | ResetAPIKeyMessage
    | SelectSlotMessage
    | DeleteSlotMessage
    | RequestOnetimeChatGPTMessage
    | RequestGenerateChatGPTPromptMessage
    | SaveAPIKeyMessage;

  type RequestMessage<M = Message> = Omit<M, "data">;
  type ResponseMessage<M = Message> = Omit<M, "input" | "error">;
}
