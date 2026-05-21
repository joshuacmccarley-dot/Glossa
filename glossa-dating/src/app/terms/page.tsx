export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: May 2026</p>
      <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900">You must be 18+</h2>
          <p>sinc&apos;d is for adults only. By using the app you confirm you are at least 18 years old.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-900">Behavior standards</h2>
          <p>You agree not to harass, threaten, or discriminate against other users. Hate speech, slurs, and explicit unsolicited content will result in immediate removal. We enforce this strictly.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-900">Subscriptions</h2>
          <p>Premium is $5/month billed via Stripe. Cancel anytime — no pro-rated refunds for partial months. Cancellation takes effect at the end of the current billing period.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-900">Content</h2>
          <p>You own your content. By posting it you grant sinc&apos;d a license to display it to other users. We may remove content that violates these terms.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-900">Limitation of liability</h2>
          <p>sinc&apos;d is a platform for connecting people. We are not responsible for the actions of individual users. Always meet in public places and trust your instincts.</p>
        </section>
      </div>
    </div>
  );
}
