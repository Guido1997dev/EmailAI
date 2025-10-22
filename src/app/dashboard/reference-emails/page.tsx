"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ReferenceEmail {
  id: string;
  subject: string | null;
  body: string;
  created_at: string;
}

export default function ReferenceEmailsPage() {
  const router = useRouter();
  const [emails, setEmails] = useState<ReferenceEmail[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchEmails();
  }, []);

  async function fetchEmails() {
    const res = await fetch("/api/reference-emails");
    if (res.ok) {
      const data = await res.json();
      setEmails(data.emails || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/reference-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: subject.trim() || null, body: body.trim() }),
    });

    setLoading(false);

    if (res.ok) {
      setSubject("");
      setBody("");
      setMessage("✅ Email toegevoegd");
      fetchEmails();
    } else {
      const data = await res.json();
      setMessage(`❌ ${data.error || "Fout"}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Weet je zeker dat je deze email wilt verwijderen?")) return;

    const res = await fetch(`/api/reference-emails?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("✅ Email verwijderd");
      fetchEmails();
    }
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    setMessage("");

    const res = await fetch("/api/analyze-tone", { method: "POST" });
    setAnalyzing(false);

    if (res.ok) {
      const data = await res.json();
      setMessage(`✅ Tone of voice bijgewerkt: "${data.tone}"`);
      setTimeout(() => router.push("/dashboard"), 2000);
    } else {
      const data = await res.json();
      setMessage(`❌ ${data.error || "Fout"}`);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <h1 className="text-2xl font-semibold">Referentie e-mails</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Upload voorbeelden van jouw e-mails. AI analyseert automatisch je tone of voice.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-3 max-w-2xl">
        <label className="grid gap-1">
          <span className="text-sm text-neutral-600 dark:text-neutral-300">Onderwerp (optioneel)</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-md border border-black/10 dark:border-white/20 p-2"
            placeholder="Re: Offerte aanvraag"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-neutral-600 dark:text-neutral-300">E-mail body</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-md border border-black/10 dark:border-white/20 p-2 min-h-32"
            placeholder="Plak hier de volledige inhoud van een e-mail die je geschreven hebt..."
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md px-4 py-2 bg-black text-white dark:bg-white dark:text-black border border-black/10 dark:border-white/20 w-max disabled:opacity-50"
        >
          {loading ? "Toevoegen..." : "Voeg toe"}
        </button>
      </form>

      {message && (
        <p className="text-sm text-neutral-700 dark:text-neutral-300 max-w-2xl">{message}</p>
      )}

      <section className="grid gap-3 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Jouw referentie e-mails ({emails.length})</h2>
          {emails.length > 0 && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="rounded-md px-4 py-2 bg-black text-white dark:bg-white dark:text-black border border-black/10 dark:border-white/20 disabled:opacity-50"
            >
              {analyzing ? "Analyseren..." : "🪄 Analyseer tone"}
            </button>
          )}
        </div>

        {emails.length === 0 ? (
          <p className="text-sm text-neutral-500">Nog geen referentie e-mails toegevoegd.</p>
        ) : (
          <div className="grid gap-3">
            {emails.map((email) => (
              <div
                key={email.id}
                className="p-4 rounded-lg border border-black/10 dark:border-white/20 grid gap-2"
              >
                {email.subject && (
                  <h3 className="font-medium text-sm">{email.subject}</h3>
                )}
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                  {email.body}
                </p>
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>{new Date(email.created_at).toLocaleDateString("nl-NL")}</span>
                  <button
                    onClick={() => handleDelete(email.id)}
                    className="text-red-600 hover:underline"
                  >
                    Verwijder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
