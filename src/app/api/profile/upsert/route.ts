import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient();
  const { id, email } = await req.json();
  if (!id || !email) return new Response("Bad Request", { status: 400 });
  const { error } = await supabase.from("profiles").upsert({ id, email });
  if (error) return new Response(error.message, { status: 500 });
  return new Response("ok");
}




