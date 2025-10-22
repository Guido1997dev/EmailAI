import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const tone = String(formData.get("tone") || "").slice(0, 2000);

  await supabase.from("profiles").upsert({ id: auth.user.id, tone_of_voice: tone });
  redirect("/dashboard");
}









