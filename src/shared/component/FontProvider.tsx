import { ReactNode, useEffect } from "react";

export default function FontProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const linkNode = document.createElement("link");
    linkNode.type = "text/css";
    linkNode.rel = "stylesheet";
    linkNode.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap";
    document.head.appendChild(linkNode);
  }, []);

  return (
    <>
      <style>{`
* {
  font-family: "Noto Sans KR", sans-serif;
}
    `}</style>
      {children}
    </>
  );
}
