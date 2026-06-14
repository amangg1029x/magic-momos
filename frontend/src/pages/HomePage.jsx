import Header       from "../components/Header";
import HeroSection   from "../components/HeroSection";
import MenuHighlights from "../components/MenuHighlights";
import WhyChooseUs   from "../components/WhyChooseUs";
import BestSellers   from "../components/BestSellers";
import Testimonials  from "../components/Testimonials";
import CTASection    from "../components/CTASection";
import Footer        from "../components/Footer";

export default function HomePage() {
  return (
    <div className="relative overflow-x-hidden">
      <Header />
      <main>
        <HeroSection />
        <MenuHighlights />
        <WhyChooseUs />
        <BestSellers />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}