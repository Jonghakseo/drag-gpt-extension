import type Chrome from "chrome";
import {
  ChatHistories,
  SessionHistories,
} from "@pages/background/lib/storage/chatHistoryStorage";

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
    type: "gpt4-turbo" | "gpt4o";
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

  type AddNewSlot = {
    type: "AddNewSlot";
    input: Slot;
    data?: "success";
  };
  type SelectSlot = {
    type: "SelectSlot";
    input: string;
    data?: "success";
  };
  type UpdateSlot = {
    type: "UpdateSlot";
    input: Slot;
    data?: "success";
  };
  type DeleteSlot = {
    type: "DeleteSlot";
    input: string;
    data?: "success";
  };
  type RequestOnetimeChatGPT = {
    type: "RequestOnetimeChatGPT";
    input: string;
    data?: { result: string };
  };
  type RequestGenerateChatGPTPrompt = {
    type: "RequestGenerateChatGPTPrompt";
    input: string;
    data?: { result: string };
  };
  type RequestOngoingChatGPT = {
    type: "RequestOngoingChatGPT";
    input: Chat[];
    data?: { result: string };
  };
  type RequestInitialDragGPT = {
    type: "RequestInitialDragGPTStream";
    input?: string;
    data?: { result: string; chunk?: string; isDone?: boolean };
  };
  type RequestDragGPT = {
    type: "RequestDragGPTStream";
    input?: { chats: Chat[]; sessionId: string };
    data?: { result: string; chunk?: string; isDone?: boolean };
  };
  type RequestQuickChatGPT = {
    type: "RequestQuickChatGPTStream";
    input?: {
      messages: Chat[];
      isGpt4Turbo: boolean;
    };
    data?: { result: string; chunk?: string; isDone?: boolean };
  };
  type SaveAPIKey = {
    type: "SaveAPIKey";
    input: string;
    data?: "success";
  };
  type ResetAPIKey = {
    type: "ResetAPIKey";
    input?: never;
    data?: "success";
  };
  type GetAPIKey = {
    type: "GetAPIKey";
    input?: never;
    data?: string;
  };
  type GetSlots = {
    type: "GetSlots";
    input?: never;
    data?: Slot[];
  };
  type GetQuickChatHistory = {
    type: "GetQuickChatHistory";
    input?: never;
    data?: Chat[];
  };
  type ResetQuickChatHistory = {
    type: "ResetQuickChatHistory";
    input?: never;
    data?: "success";
  };
  type PushChatHistory = {
    type: "PushChatHistory";
    input: { chats: Chat | Chat[]; sessionId: string };
    data?: "success";
  };
  type SaveChatHistory = {
    type: "SaveChatHistory";
    input: { chats: Chat[]; sessionId: string; type: "Quick" | "Drag" };
    data?: "success";
  };
  type DeleteAllChatHistory = {
    type: "DeleteAllChatHistory";
    input?: never;
    data?: "success";
  };
  type DeleteChatHistorySession = {
    type: "DeleteChatHistorySession";
    input: string;
    data?: "success";
  };
  type GetAllChatHistory = {
    type: "GetAllChatHistory";
    input?: never;
    data?: ChatHistories;
  };
  type GetChatSessionHistory = {
    type: "GetChatSessionHistory";
    input: string;
    data?: SessionHistories;
  };
  type ErrorMessage = {
    type: "Error";
    input?: never;
    error: Error;
  };

  type Message =
    | RequestInitialDragGPT
    | RequestQuickChatGPT
    | RequestDragGPT
    | RequestOngoingChatGPT
    | ResetQuickChatHistory
    | SaveChatHistory
    | PushChatHistory
    | GetAllChatHistory
    | DeleteAllChatHistory
    | DeleteChatHistorySession
    | GetChatSessionHistory
    | GetQuickChatHistory
    | AddNewSlot
    | UpdateSlot
    | GetSlots
    | GetAPIKey
    | ResetAPIKey
    | SelectSlot
    | DeleteSlot
    | RequestOnetimeChatGPT
    | RequestGenerateChatGPTPrompt
    | SaveAPIKey;

  type RequestMessage<M = Message> = Omit<M, "data">;
  type ResponseMessage<M = Message> = Omit<M, "input" | "error">;
}
