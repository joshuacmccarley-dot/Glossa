export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: May 2026</p>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900">What we collect</h2>
          <p>We collect your email address, display name, profile information (bio, interests, location), and photos you upload. We collect usage data to improve the app.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-900">How we use it</h2>
          <p>Your data is used to power matching, show you relevant people and events, and send you notifications about your matches. We do not sell your data to third parties. Ever.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-900">Location data</h2>
          <p>We only store your city/region for distance filtering. Your exact GPS coordinates are used in-session to calculate distances but are stored only if you share your precise location. You can clear this from your profile settings.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-900">Data deletion</h2>
          <p>You can delete your account at any time from your profile. This removes all your data from our systems within 30 days.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-900">Contact</h2>
          <p>Questions? Email privacy@sincd.app</p>
        </section>
      </div>
    </div>
  );
}
