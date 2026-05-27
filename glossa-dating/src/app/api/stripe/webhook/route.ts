import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StripeObj = Record<string, any>;

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-04-22.dahlia" });
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  function getUserId(obj: StripeObj): string | null {
    return obj?.metadata?.supabase_user_id ?? null;
  }

  try {
    const obj = event.data.object as StripeObj;

    switch (event.type) {
      case "checkout.session.completed": {
        const userId = getUserId(obj);
        const subId = typeof obj.subscription === "string" ? obj.subscription : null;
        if (userId && subId) {
          const stripeSub = (await stripe.subscriptions.retrieve(subId)) as StripeObj;
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_subscription_id: subId,
            stripe_customer_id: typeof obj.customer === "string" ? obj.customer : null,
            status: "active",
            current_period_end: stripeSub.current_period_end
              ? new Date(stripeSub.current_period_end * 1000).toISOString()
              : null,
          }, { onConflict: "user_id" });
          await supabase.from("profiles").update({ is_premium: true }).eq("user_id", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const userId = getUserId(obj);
        if (userId) {
          const isActive = ["active", "trialing"].includes(obj.status);
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_subscription_id: obj.id,
            status: obj.status,
            current_period_end: obj.current_period_end
              ? new Date(obj.current_period_end * 1000).toISOString()
              : null,
          }, { onConflict: "user_id" });
          await supabase.from("profiles").update({ is_premium: isActive }).eq("user_id", userId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const userId = getUserId(obj);
        if (userId) {
          await supabase.from("subscriptions").update({ status: "canceled" }).eq("user_id", userId);
          await supabase.from("profiles").update({ is_premium: false }).eq("user_id", userId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const subId = typeof obj.subscription === "string" ? obj.subscription : null;
        if (subId) {
          const stripeSub = (await stripe.subscriptions.retrieve(subId)) as StripeObj;
          const userId = getUserId(stripeSub);
          if (userId) {
            await supabase.from("subscriptions").update({ status: "past_due" }).eq("user_id", userId);
          }
        }
        break;
      }
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
