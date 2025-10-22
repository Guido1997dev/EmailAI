"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function signUpWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setLoading(false);
    if (error) return setMessage(error.message);
    if (data.user) {
      await fetch("/api/profile/upsert", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: data.user.id, email: data.user.email }) });
      router.replace("/dashboard");
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setLoading(false);
    if (error) return setMessage(error.message);
    setMessage("Magic link verzonden. Check je e-mail.");
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12 grid gap-6">
      <h1 className="text-2xl font-semibold">Account aanmaken</h1>
      <form onSubmit={signUpWithPassword} className="grid gap-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="E-mail" className="rounded-md border border-black/10 dark:border-white/20 p-2" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Wachtwoord" className="rounded-md border border-black/10 dark:border-white/20 p-2" required />
        <button disabled={loading} className="rounded-md px-4 py-2 bg-black text-white dark:bg-white dark:text-black border border-black/10 dark:border-white/20" type="submit">Sign up</button>
      </form>

      <form onSubmit={sendMagicLink} className="grid gap-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="E-mail" className="rounded-md border border-black/10 dark:border-white/20 p-2" required />
        <button disabled={loading} className="rounded-md px-4 py-2 border border-black/10 dark:border-white/20" type="submit">Stuur magic link</button>
      </form>

      {message && <p className="text-sm text-neutral-600 dark:text-neutral-300">{message}</p>}
    </main>
  );
}









