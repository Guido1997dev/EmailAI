"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function PanelPage() {
  const supabase = getSupabaseBrowserClient();
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const requestedRef = useRef(false);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const msg = e.data;
      if (msg && msg.type === "MAILSPRINT_CONTEXT" && typeof msg.text === "string") {
        setContext(msg.text);
      }
    }
    window.addEventListener("message", onMessage);
    // Ask the host page (content script) for context once on mount
    if (!requestedRef.current) {
      requestedRef.current = true;
      window.parent?.postMessage({ type: "MAILSPRINT_REQUEST_CONTEXT" }, "*");
    }
    return () => window.removeEventListener("message", onMessage);
  }, []);

  async function generate() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/generateMail", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ context }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setResult(json.email || "");
    } catch (e) {
      setResult("Kon geen e-mail genereren. Log in op MailSprint en probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(result).catch(() => {});
  }

  function pasteIntoHost() {
    window.parent?.postMessage({ type: "MAILSPRINT_PASTE", text: result }, "*");
  }

  return (
    <main className="mx-auto px-4 py-3 grid gap-3 text-sm" style={{ color: "inherit" }}>
      <div className="flex items-center justify-between">
        <strong>MailSprint AI</strong>
        <div className="flex gap-2">
          <button onClick={() => window.parent?.postMessage({ type: "MAILSPRINT_TOGGLE" }, "*")} className="border px-2 py-1 rounded">Close</button>
        </div>
      </div>
      <div className="grid gap-2">
        <div style={{ opacity: 0.8 }}>Context / bullets</div>
        <textarea value={context} onChange={(e) => setContext(e.target.value)} className="w-full min-h-28 p-2 rounded border" />
        <div className="flex gap-2">
          <button disabled={loading} onClick={generate} className="px-3 py-1 rounded border bg-black text-white dark:bg-white dark:text-black">Genereer e-mail</button>
          <button onClick={() => window.parent?.postMessage({ type: "MAILSPRINT_REQUEST_CONTEXT" }, "*")} className="px-3 py-1 rounded border">Laad context</button>
        </div>
      </div>
      <div className="grid gap-2">
        <div style={{ opacity: 0.8 }}>Resultaat</div>
        <textarea value={result} onChange={(e) => setResult(e.target.value)} className="w-full min-h-40 p-2 rounded border" />
        <div className="flex gap-2">
          <button onClick={copyToClipboard} className="px-3 py-1 rounded border">Kopieer</button>
          <button onClick={pasteIntoHost} className="px-3 py-1 rounded border">Plak in Gmail</button>
        </div>
      </div>
    </main>
  );
}


