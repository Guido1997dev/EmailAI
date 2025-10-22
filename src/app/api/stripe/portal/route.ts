import { stripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Unauthorized", { status: 401 });

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  // Note: Stripe billing portal requires customer ID, not email.
  // This will need proper Stripe customer creation in production.
  // For now, we'll use a placeholder approach.
  const session = await stripe.billingPortal.sessions.create({
    customer: auth.user.email || "unknown",
    return_url: `${origin}/dashboard/billing`,
  });

  if (!session.url) return new Response("No portal URL", { status: 500 });
  return Response.redirect(session.url, 303);
}


