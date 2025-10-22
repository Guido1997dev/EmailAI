import { stripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Unauthorized", { status: 401 });

  const priceId = process.env.STRIPE_PRICE_ID_PRO || "";
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/dashboard/billing?checkout=cancel`,
    customer_email: auth.user.email || undefined,
    metadata: { user_id: auth.user.id },
  });

  if (!session.url) return new Response("No session URL", { status: 500 });
  return Response.redirect(session.url, 303);
}


