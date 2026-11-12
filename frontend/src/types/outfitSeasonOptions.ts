// placeholder images until there are season-specific ones; swap them here
import allOutfits from "../assets/images/allOutfits.jpeg";
import summerOutfit from "../assets/images/summerOutfit.jpeg";
import springOutfit from "../assets/images/springOutfit.jpeg";
import fallOutfit from "../assets/images/fallOutfit.jpeg";
import winterOutfit from "../assets/images/winterOutfit.jpeg";
import type { OutfitSeason } from "./Outfit";

export const ALL_OUTFITS = "All Outfits";

export type SeasonOption = typeof ALL_OUTFITS | OutfitSeason;

// in calendar order rather than OUTFIT_SEASONS' alphabetical order
export const SEASON_OPTIONS = [
  { value: ALL_OUTFITS, image: allOutfits },
  { value: "Spring", image: springOutfit },
  { value: "Summer", image: summerOutfit },
  { value: "Fall", image: fallOutfit },
  { value: "Winter", image: winterOutfit },
] as const satisfies readonly { value: SeasonOption; image: string }[];
