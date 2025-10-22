import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

async function getUser() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export default async function BillingPage() {
  const user = await getUser();
  if (!user) return null;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Billing</h1>
      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        <form action="/api/stripe/checkout" method="post" className="p-6 rounded-lg border border-black/10 dark:border-white/20 grid gap-3">
          <div>
            <h2 className="text-xl font-medium">Pro</h2>
            <p className="text-neutral-600 dark:text-neutral-300">Onbeperkte generaties</p>
          </div>
          <button type="submit" className="rounded-md px-4 py-2 bg-black text-white dark:bg-white dark:text-black border border-black/10 dark:border-white/20 w-max">Upgrade</button>
        </form>
        <form action="/api/stripe/portal" method="post" className="p-6 rounded-lg border border-black/10 dark:border-white/20 grid gap-3">
          <div>
            <h2 className="text-xl font-medium">Abonnement beheren</h2>
            <p className="text-neutral-600 dark:text-neutral-300">Wijzig of annuleer</p>
          </div>
          <button type="submit" className="rounded-md px-4 py-2 border border-black/10 dark:border-white/20 w-max">Open portal</button>
        </form>
      </div>
      <p className="text-sm text-neutral-500">Heb je vragen? <Link href="mailto:support@mailsprint.ai" className="underline">support@mailsprint.ai</Link></p>
    </div>
  );
}









