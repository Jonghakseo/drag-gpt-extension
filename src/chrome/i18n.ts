import type KoMessage from "../../public/_locales/ko/messages.json";
import type EnMessage from "../../public/_locales/en/messages.json";
import type JaMessage from "../../public/_locales/ja/messages.json";
import type CnMessage from "../../public/_locales/zh_CN/messages.json";

type MessageKey =
  | typeof KoMessage
  | typeof EnMessage
  | typeof JaMessage
  | typeof CnMessage;

export function t(messageNameKey: keyof MessageKey) {
  return chrome.i18n.getMessage(messageNameKey);
}
