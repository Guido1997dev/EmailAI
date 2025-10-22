import { stripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Unauthorized", { status: 401 });

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer_email: auth.user.email || undefined,
    return_url: `${origin}/dashboard/billing`,
  } as any);

  if (!session.url) return new Response("No portal URL", { status: 500 });
  return Response.redirect(session.url, 303);
}


