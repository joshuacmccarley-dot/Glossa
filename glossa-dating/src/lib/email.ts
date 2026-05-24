import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "sinc'd <hello@sincd.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://sincd.app";

// Generic send helper
async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return; // skip in dev if not configured
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] Failed to send:", err);
  }
}

// ── Templates ──────────────────────────────────────────────────────────────

function wrap(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;color:#111827}
.card{max-width:480px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.header{background:linear-gradient(135deg,#059669,#0d9488);padding:32px;text-align:center}
.header h1{color:#fff;font-size:28px;font-weight:900;margin:0;letter-spacing:-1px}
.header p{color:rgba(255,255,255,.75);margin:4px 0 0;font-size:14px}
.body{padding:32px}.body p{color:#4b5563;line-height:1.6;margin:0 0 16px}
.cta{display:block;background:linear-gradient(135deg,#059669,#0d9488);color:#fff!important;text-decoration:none;font-weight:700;font-size:16px;padding:16px 32px;border-radius:100px;text-align:center;margin:24px 0}
.footer{text-align:center;padding:20px;font-size:12px;color:#9ca3af}
.badge{display:inline-block;background:#ecfdf5;color:#059669;font-size:12px;font-weight:700;padding:4px 12px;border-radius:100px;margin-bottom:16px}
.timer{background:#fef3c7;border:1px solid #fde68a;border-radius:16px;padding:16px;text-align:center;margin:16px 0}
.timer strong{color:#92400e;font-size:18px}</style></head>
<body><div class="card">${body}</div></body></html>`;
}

// ── Welcome email ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  await send(
    to,
    "Welcome to sinc'd",
    wrap(`
      <div class="header"><h1>sinc'd</h1><p>Feel connected without questioning</p></div>
      <div class="body">
        <div class="badge">You're in</div>
        <h2 style="font-size:22px;font-weight:900;margin:0 0 12px">Hey ${name}!</h2>
        <p>You just joined a community built around real connection — not mindless swiping.</p>
        <p>Browse people by interest, show up to events, lend a hand, or just make friends in your city. You can be here for any of it.</p>
        <a class="cta" href="${APP_URL}/discover">Start exploring →</a>
        <p style="font-size:13px;color:#9ca3af">Remember: profiles with a photo get 10× more connections. Add yours from your profile page.</p>
      </div>
      <div class="footer">sinc'd · <a href="${APP_URL}/privacy" style="color:#9ca3af">Privacy</a> · <a href="${APP_URL}/unsubscribe" style="color:#9ca3af">Unsubscribe</a></div>
    `)
  );
}

// ── New match email ────────────────────────────────────────────────────────

export async function sendMatchEmail(to: string, userName: string, matchName: string, matchId: string) {
  await send(
    to,
    `You matched with ${matchName} on sinc'd`,
    wrap(`
      <div class="header"><h1>It's a match!</h1><p>sinc'd</p></div>
      <div class="body">
        <div class="badge">New match</div>
        <h2 style="font-size:22px;font-weight:900;margin:0 0 12px">Hey ${userName}!</h2>
        <p>You and <strong>${matchName}</strong> are sinc'd. You both liked each other — now it's time to say something real.</p>
        <div class="timer">
          <strong>12-hour window is open</strong><br>
          <span style="color:#78350f;font-size:13px">Send a message before the clock runs out</span>
        </div>
        <a class="cta" href="${APP_URL}/chat/${matchId}">Start the conversation →</a>
        <p style="font-size:13px;color:#9ca3af">The match expires if neither person sends a message within 12 hours. Premium members can always recover expired matches.</p>
      </div>
      <div class="footer">sinc'd · <a href="${APP_URL}/privacy" style="color:#9ca3af">Privacy</a> · <a href="${APP_URL}/unsubscribe" style="color:#9ca3af">Unsubscribe</a></div>
    `)
  );
}

// ── Match expiring soon ────────────────────────────────────────────────────

export async function sendMatchExpiringEmail(to: string, userName: string, matchName: string, matchId: string, hoursLeft: number) {
  await send(
    to,
    `⏱️ Your match with ${matchName} expires in ${hoursLeft}h`,
    wrap(`
      <div class="header" style="background:linear-gradient(135deg,#d97706,#b45309)"><h1>Time's running out</h1><p>sinc'd</p></div>
      <div class="body">
        <div class="badge" style="background:#fef3c7;color:#92400e">Expiring soon</div>
        <h2 style="font-size:22px;font-weight:900;margin:0 0 12px">Hey ${userName},</h2>
        <p>Your match with <strong>${matchName}</strong> expires in <strong>${hoursLeft} hours</strong>. Say something now — before it's gone.</p>
        <a class="cta" href="${APP_URL}/chat/${matchId}">Message ${matchName} →</a>
        <p style="font-size:13px;color:#9ca3af">Didn't get to it in time? Upgrade to sinc'd Premium for $5/month to recover any expired match.</p>
      </div>
      <div class="footer">sinc'd · <a href="${APP_URL}/pricing" style="color:#9ca3af">Get Premium</a></div>
    `)
  );
}

// ── Help response notification ─────────────────────────────────────────────

export async function sendHelpResponseEmail(to: string, userName: string, responderName: string, postTitle: string, postId: string) {
  await send(
    to,
    `🤝 ${responderName} responded to your sinc'd post`,
    wrap(`
      <div class="header"><h1>Someone responded</h1><p>sinc'd · Lend a Hand</p></div>
      <div class="body">
        <div class="badge">Help response</div>
        <h2 style="font-size:22px;font-weight:900;margin:0 0 12px">Hey ${userName}!</h2>
        <p><strong>${responderName}</strong> responded to your post: <em>&ldquo;${postTitle}&rdquo;</em></p>
        <a class="cta" href="${APP_URL}/help/inbox">See the response →</a>
      </div>
      <div class="footer">sinc'd</div>
    `)
  );
}

// ── Event RSVP notification ────────────────────────────────────────────────

export async function sendEventRsvpEmail(to: string, creatorName: string, attendeeName: string, eventTitle: string, eventId: string) {
  await send(
    to,
    `🎉 ${attendeeName} is going to your event`,
    wrap(`
      <div class="header" style="background:linear-gradient(135deg,#d97706,#ea580c)"><h1>New RSVP!</h1><p>sinc'd · Events</p></div>
      <div class="body">
        <div class="badge" style="background:#fef3c7;color:#92400e">Event update</div>
        <p>Hey ${creatorName}!</p>
        <p><strong>${attendeeName}</strong> just RSVPed to your event: <em>&ldquo;${eventTitle}&rdquo;</em></p>
        <a class="cta" href="${APP_URL}/events/${eventId}">View your event →</a>
      </div>
      <div class="footer">sinc'd</div>
    `)
  );
}
