import SessionTrackerPopup from "@/components/landing/sessionTrackerPopup";
import ProductNav from "@/components/landing/productPage/sections/ProductNav";
import ProductHero from "@/components/landing/productPage/sections/ProductHero";
import MetricsSection from "@/components/landing/productPage/sections/MetricsSection";
import FeaturesSection from "@/components/landing/productPage/sections/FeaturesSection";
import ProductPreviewSection from "@/components/landing/productPage/sections/ProductPreviewSection";
import TestimonialsSection from "@/components/landing/productPage/sections/TestimonialsSection";
import PricingSection from "@/components/landing/productPage/sections/PricingSection";
import IntegrationsSection from "@/components/landing/productPage/sections/IntegrationsSection";
import FinalCTA from "@/components/landing/productPage/sections/FinalCTA";
import ProductFooter from "@/components/landing/productPage/sections/ProductFooter";

export default function ProductPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <SessionTrackerPopup />
      <ProductNav />
      <ProductHero />
      <MetricsSection />
      <FeaturesSection />
      <ProductPreviewSection />
      <TestimonialsSection />
      <PricingSection />
      <IntegrationsSection />
      <FinalCTA />
      <ProductFooter />
    </div>
  );
}
