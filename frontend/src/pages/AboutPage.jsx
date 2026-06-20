import Header          from "../components/Header";
import Footer          from "../components/Footer";
import CTASection      from "../components/CTASection";
import AboutPageHero   from "../components/AboutPageHero";
import OurStory        from "../components/OurStory";
import MilestonesSection from "../components/MilestonesSection";
import TeamSection     from "../components/TeamSection";
import ValuesSection   from "../components/ValuesSection";
import GalleryStrip    from "../components/GalleryStrip";
import { useNav } from "../context/NavigationContext";

export default function AboutPage() {
  const { isNative } = useNav();
  return (
    <div className="relative min-h-screen bg-mm-black overflow-x-hidden">
      {/* ✅ Reused: Header (no cart on this page) */}
      <Header />

      <main>
        {/* Banner + breadcrumb + quick-facts strip */}
        <AboutPageHero />

        {/* Narrative text + animated 6-step vertical timeline */}
        <OurStory />

        {/* 4 animated counter cards: customers, orders, rating, items */}
        <MilestonesSection />

        {/* 4 team member cards with emoji avatars and quotes */}
        <TeamSection />

        {/* 3 core value cards with proof points */}
        <ValuesSection />

        {/* Bento-grid food gallery — click to navigate to menu */}
        <GalleryStrip />

        {/* ✅ Reused: CTA section from home page */}
        <CTASection />
      </main>

      {/* ✅ Reused: Footer */}
      {!isNative && <Footer />}
    </div>
  );
}