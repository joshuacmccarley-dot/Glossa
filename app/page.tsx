import Navbar         from "@/components/Navbar";
import Hero           from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import KitsSection    from "@/components/KitsSection";
import TrustSection   from "@/components/TrustSection";
import ContactSection from "@/components/ContactSection";
import Footer         from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <Hero />
        <ProductsSection />
        <KitsSection />
        <TrustSection />
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
