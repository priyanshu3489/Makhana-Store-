"use client";

import { useEffect } from "react";

const TAB_MESSAGES = [
  "Pearls of Makhana ✨ | FOXBERRY",
  "Hey! Your crunch is waiting 🦊",
  "Don't miss out!",
  "A little crunch, a lot of joy",
];

export default function TabAttentionTitle() {
  useEffect(() => {
    const originalTitle = document.title;
    let messageIndex = 0;
    let interval: number | undefined;

    const stopRotation = () => {
      if (interval !== undefined) {
        window.clearInterval(interval);
        interval = undefined;
      }
    };

    const startRotation = () => {
      if (document.visibilityState === "visible") return;
      stopRotation();
      document.title = TAB_MESSAGES[messageIndex % TAB_MESSAGES.length];
      messageIndex += 1;
      interval = window.setInterval(() => {
        document.title = TAB_MESSAGES[messageIndex % TAB_MESSAGES.length];
        messageIndex += 1;
      }, 2600);
    };

    const restoreTitle = () => {
      stopRotation();
      document.title = originalTitle;
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") startRotation();
      else restoreTitle();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", startRotation);
    window.addEventListener("focus", restoreTitle);

    return () => {
      stopRotation();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", startRotation);
      window.removeEventListener("focus", restoreTitle);
      document.title = originalTitle;
    };
  }, []);

  return null;
}
