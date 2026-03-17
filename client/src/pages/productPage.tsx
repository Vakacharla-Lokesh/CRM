import SessionTrackerPopup from "@/components/landing/sessionTrackerPopup";
import ProductNav from "@/components/landing/productPage/sections/productNav";
import ProductHero from "@/components/landing/productPage/sections/productHero";
import MetricsSection from "@/components/landing/productPage/sections/metricsSection";
import FeaturesSection from "@/components/landing/productPage/sections/featuresSection";
import ProductPreviewSection from "@/components/landing/productPage/sections/productPreviewSection";
import TestimonialsSection from "@/components/landing/productPage/sections/testimonialsSection";
import PricingSection from "@/components/landing/productPage/sections/pricingSection";
import IntegrationsSection from "@/components/landing/productPage/sections/integrationsSection";
import FinalCTA from "@/components/landing/productPage/sections/finalCTA";
import ProductFooter from "@/components/landing/productPage/sections/productFooter";

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
