import { HeroSection } from "./HeroSection";
import { CategoryMarquee } from "./CategoryMarquee";
import { MainFeatureSection } from "./MainFeatureSection";
import { SecondaryFeatureSection } from "./SecondaryFeatureSection";
import { TripleFeaturesSection } from "./TripleFeaturesSection";
import { FinalCTA } from "./FinalCTA";

export const Home = () => {
  return (
    <div className="overflow-x-hidden bg-stone-50">
      <HeroSection />
      <CategoryMarquee />
      <MainFeatureSection />
      <SecondaryFeatureSection />
      <TripleFeaturesSection />
      <FinalCTA />
    </div>
  );
};
