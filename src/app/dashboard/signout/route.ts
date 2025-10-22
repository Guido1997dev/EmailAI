import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST() {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}




