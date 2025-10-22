import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function signOut() {
  "use server";
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <header className="border-b border-black/10 dark:border-white/20">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold">MailSprint AI</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/dashboard" className="hover:underline">Instellingen</Link>
            <Link href="/dashboard/reference-emails" className="hover:underline">Referentie emails</Link>
            <Link href="/dashboard/billing" className="hover:underline">Billing</Link>
            <form action={signOut}>
              <button className="hover:underline" type="submit">Uitloggen</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8 w-full">{children}</main>
    </div>
  );
}









