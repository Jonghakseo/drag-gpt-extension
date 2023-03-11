import type Message from "../../public/_locales/ko/messages.json";

export function t(messageNameKey: keyof typeof Message) {
  return chrome.i18n.getMessage(messageNameKey);
}
