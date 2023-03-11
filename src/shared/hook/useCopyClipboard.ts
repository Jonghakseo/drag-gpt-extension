import { DependencyList, useEffect, useState } from "react";

export function useCopyClipboard(copiedResetEffectDeps?: DependencyList) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsCopied(false);
  }, copiedResetEffectDeps);

  const copy = async (lastResponseText: string) => {
    await copyToClipboard(lastResponseText);
    setIsCopied(true);
  };

  return {
    isCopied,
    copy,
  };
}
async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}
