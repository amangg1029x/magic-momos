import Header       from "../components/Header";
import DeliveryZoneBanner from "../components/DeliveryZoneBanner";
import HeroSection   from "../components/HeroSection";
import MenuHighlights from "../components/MenuHighlights";
import WhyChooseUs   from "../components/WhyChooseUs";
import BestSellers   from "../components/BestSellers";
//import Testimonials  from "../components/Testimonials";
import AppDownloadSection from "../components/AppDownloadSection";
import CTASection    from "../components/CTASection";
import Footer        from "../components/Footer";
import { useNav } from "../context/NavigationContext";

export default function HomePage() {
  const { isNative } = useNav();
  return (
    <div className="relative overflow-x-hidden">
      <Header />
      <DeliveryZoneBanner />
      <main>
        <HeroSection />
        <MenuHighlights />
        <WhyChooseUs />
        <BestSellers />
        {!isNative && <AppDownloadSection />}
        <CTASection />
      </main>
      {!isNative && <Footer />}
    </div>
  );
}