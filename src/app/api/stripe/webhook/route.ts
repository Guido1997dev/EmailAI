import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import type { Stripe } from "stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const sig = headers().get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig as string, webhookSecret);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (userId) {
        await supabase
          .from("profiles")
          .upsert({ id: userId, is_pro: true });
      }
      break;
    }
    case "customer.subscription.deleted":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerEmail = subscription.customer_email as string | undefined;
      if (customerEmail) {
        const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1, email: customerEmail });
        const user = data.users?.[0];
        if (user) {
          const active = subscription.status === "active" || subscription.status === "trialing";
          await supabase.from("profiles").upsert({ id: user.id, is_pro: active });
        }
      }
      break;
    }
    default:
      break;
  }

  return new Response("ok");
}

export const dynamic = "force-dynamic";









