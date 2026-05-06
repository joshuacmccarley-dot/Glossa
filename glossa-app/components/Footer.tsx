import Link from "next/link";

const footerLinks = {
  Product: [
    { href: "/learn", label: "Language Learning" },
    { href: "/connect", label: "Translation Network" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
  ],
  Company: [
    { href: "#", label: "About Us" },
    { href: "#", label: "Blog" },
    { href: "#", label: "Careers" },
    { href: "#", label: "Press" },
  ],
  Support: [
    { href: "#", label: "Help Center" },
    { href: "#", label: "Contact Us" },
    { href: "#", label: "Community" },
    { href: "#", label: "API Docs" },
  ],
  Legal: [
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
    { href: "#", label: "Cookie Policy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                <span className="text-navy font-display font-bold">G</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-white text-xl">Glossa</span>
                <span className="text-gold text-[10px] font-semibold tracking-wide uppercase">In-Depth Language Learning</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Master any language faster. Connect with any culture instantly. Glossa arms you with the tools to conquer language barriers — for good.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {["Twitter", "LinkedIn", "TikTok", "Discord"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="text-white/40 hover:text-gold transition-colors text-xs font-medium"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-display font-semibold text-white text-sm mb-4 tracking-wide">{category}</h3>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-white/50 hover:text-gold text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Glossa. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Breaking language barriers — one conversation at a time.
          </p>
        </div>
      </div>
    </footer>
  );
}
