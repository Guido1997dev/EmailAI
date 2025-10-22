import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getUser() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

async function getProfile(userId: string) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("profiles").select("tone_of_voice").eq("id", userId).maybeSingle();
  return data;
}

async function saveSettings(formData: FormData) {
  "use server";
  const supabase = await getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  const tone = String(formData.get("tone") || "").slice(0, 2000);
  await supabase.from("profiles").upsert({ id: auth.user.id, tone_of_voice: tone });
  revalidatePath("/dashboard");
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/auth");
  const profile = await getProfile(user.id);

  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <h1 className="text-2xl font-semibold">Instellingen</h1>
        <p className="text-neutral-600 dark:text-neutral-300">Stel je tone of voice in voor gegenereerde e-mails.</p>
      </section>

      <form action={saveSettings} className="grid gap-3 max-w-2xl">
        <label className="grid gap-1">
          <span className="text-sm text-neutral-600 dark:text-neutral-300">Tone of voice</span>
          <textarea name="tone" defaultValue={profile?.tone_of_voice || "professioneel, vriendelijk, to-the-point"} className="w-full rounded-md border border-black/10 dark:border-white/20 p-2 min-h-28" />
        </label>
        <button type="submit" className="rounded-md px-4 py-2 bg-black text-white dark:bg-white dark:text-black border border-black/10 dark:border-white/20 w-max">Opslaan</button>
      </form>

      <section className="grid gap-2">
        <h2 className="text-xl font-medium">Snel testen</h2>
        <TestForm />
      </section>
    </div>
  );
}

function TestForm() {
  return (
    <form action="/api/generateMail" method="post" className="grid gap-3 max-w-2xl">
      <label className="grid gap-1">
        <span className="text-sm text-neutral-600 dark:text-neutral-300">Context of bullets</span>
        <textarea name="context" className="w-full rounded-md border border-black/10 dark:border-white/20 p-2 min-h-28" />
      </label>
      <button type="submit" className="rounded-md px-4 py-2 border border-black/10 dark:border-white/20 w-max">Genereer e-mail</button>
    </form>
  );
}









