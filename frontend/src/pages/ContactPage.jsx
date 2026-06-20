import Header         from "../components/Header";
import Footer         from "../components/Footer";
import ContactPageHero from "../components/ContactPageHero";
import ContactForm    from "../components/ContactForm";
import FAQAccordion   from "../components/FAQAccordion";
import MapAndHours    from "../components/MapAndHours";
import { useNav } from "../context/NavigationContext";

export default function ContactPage() {
  const { isNative } = useNav();
  return (
    <div className="relative min-h-screen bg-mm-black overflow-x-hidden">
      {/* ✅ Reused */}
      <Header />

      <main>
        {/* Banner + quick-info cards */}
        <ContactPageHero />

        {/* Contact form + why reach out */}
        <ContactForm />

        {/* Map + opening hours */}
        <MapAndHours />

        {/* FAQ accordion */}
        <FAQAccordion />
      </main>

      {/* ✅ Reused */}
      {!isNative && <Footer />}
    </div>
  );
}