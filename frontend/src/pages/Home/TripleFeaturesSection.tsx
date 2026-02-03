import { FeatureCard } from "../../components/ui/FeatureCard";
import organizedClothes from "../../assets/images/organizedClothes.jpg";
import singleShirt from "../../assets/images/singleShirt.jpg";
import tryingOnClothes from "../../assets/images/tryingOnClothes.jpg";

export const TripleFeaturesSection = () => {
  return (
    <section className="flex justify-evenly items-center p-14 gap-10">
      <FeatureCard
        image={organizedClothes}
        headline="Your Entire Wardrobe, Finally Organized"
        text="Stop digging through piles of clothes. Wardrobe.io lets you neatly catalogue every item in your closet — categorize by type, colour, season, or style, and instantly find pieces you forgot you even owned. It’s the easiest way to stay organized and make the most of what you already have."
      ></FeatureCard>
      <FeatureCard
        image={tryingOnClothes}
        headline="Create Outfits Before You Try Them On"
        text="Mix and match your wardrobe digitally to plan outfits in seconds. No need to physically try on every combination — visualize your looks, save your favourites, and get styling inspiration effortlessly. It’s your personal outfit planner built right in."
      ></FeatureCard>
      <FeatureCard
        image={singleShirt}
        headline="Refresh Your Style, Not Your Budget"
        text="Sell the clothes you don’t wear and discover unique pieces from others’ wardrobes. Wardrobe.io turns sustainable shopping into a smooth, simple experience — clear space, earn money, and build a wardrobe that evolves with you."
      ></FeatureCard>
    </section>
  );
};
