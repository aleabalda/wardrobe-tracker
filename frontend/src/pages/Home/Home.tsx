import { HeroSection } from "./HeroSection";
import { MainFeatureSection } from "./MainFeatureSection";
import { SecondaryFeatureSection } from "./SecondaryFeatureSection";
import { TripleFeaturesSection } from "./TripleFeaturesSection";
import { FinalCTA } from "./FinalCTA";

export const Home = () => {
  return (
    <>
      <HeroSection />
      <MainFeatureSection />
      <SecondaryFeatureSection />
      <TripleFeaturesSection />
      <FinalCTA />
    </>
  );
};
