import webpush from "web-push";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:hello@sincd.app";

let vapidConfigured = false;
function ensureVapid() {
  if (vapidConfigured || !VAPID_PUBLIC || !VAPID_PRIVATE) return !!VAPID_PUBLIC;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  vapidConfigured = true;
  return true;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendPushNotification(
  sub: PushSubscriptionRecord,
  payload: { title: string; body: string; url?: string; icon?: string }
) {
  if (!ensureVapid()) return;
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url ?? "/",
        icon: payload.icon ?? "/icons/icon-192.png",
        badge: "/icons/badge-72.png",
      })
    );
  } catch (err: unknown) {
    // 410 Gone = subscription expired/revoked; caller should delete it
    if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
      throw Object.assign(new Error("subscription_expired"), { code: "PUSH_GONE" });
    }
    console.error("[push] Failed:", err);
  }
}

export async function sendMatchPush(sub: PushSubscriptionRecord, matchName: string, matchId: string) {
  return sendPushNotification(sub, {
    title: "It's a match!",
    body: `You and ${matchName} are sinc'd — send the first message before the 12-hour window closes.`,
    url: `/chat/${matchId}`,
  });
}

export async function sendMatchExpiringPush(sub: PushSubscriptionRecord, matchName: string, matchId: string, hoursLeft: number) {
  return sendPushNotification(sub, {
    title: `${hoursLeft}h left with ${matchName}`,
    body: "Your match expires soon — send a message now.",
    url: `/chat/${matchId}`,
  });
}

export async function sendMessagePush(sub: PushSubscriptionRecord, senderName: string, matchId: string) {
  return sendPushNotification(sub, {
    title: `New message from ${senderName}`,
    body: "Open the conversation to reply.",
    url: `/chat/${matchId}`,
  });
}
