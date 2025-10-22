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
      <div className="p-6 rounded-lg border border-black/10 dark:border-white/20 grid gap-3 max-w-2xl">
        <p className="text-neutral-600 dark:text-neutral-300">
          Billing-functionaliteit zal binnenkort beschikbaar zijn.
        </p>
      </div>
      <p className="text-sm text-neutral-500">Heb je vragen? <Link href="mailto:support@mailsprint.ai" className="underline">support@mailsprint.ai</Link></p>
    </div>
  );
}









