"use client";

import { useEffect } from "react";
import { isInspectorMessage, isPreviewConsoleMessage } from "@/lib/preview-inspect-bridge";

const PREFIX = "[preview]";

// Pipes iframe `console.log/warn/error/info/debug` calls — forwarded by the
// runtime shim injected by the gateway port-proxy — into the parent window's
// console with a `[preview]` prefix. Lets developers see iframe diagnostics
// without manually switching DevTools' execution context to the iframe.
export function usePreviewConsoleForwarder(): void {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!isInspectorMessage(event.data)) return;
      if (!isPreviewConsoleMessage(event.data)) return;
      const { level, args } = event.data.payload;
      const fn = console[level] ?? console.log;
      fn.call(console, PREFIX, ...args);
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
}
