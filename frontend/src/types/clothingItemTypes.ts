// import base images for each clothing type here, e.g.
// import topsImage from "../assets/images/tops.jpg";
import coat from "../assets/images/outerwear.jpeg";
import shirt from "../assets/images/top.jpeg";
import jeans from "../assets/images/bottoms.jpeg";
import shoes from "../assets/images/shoes.jpeg";
import dress from "../assets/images/dress.jpeg";
import underwearSocks from "../assets/images/underwear-socks.jpeg";
import hat from "../assets/images/accessory.jpeg";
import outfit from "../assets/images/outfit.jpeg";

export const CLOTHING_TYPES = [
  { type: "All Clothing", image: outfit },
  { type: "Tops", image: shirt },
  { type: "Bottoms", image: jeans },
  { type: "Dresses & Jumpsuits", image: dress },
  { type: "Outerwear", image: coat },
  { type: "Shoes", image: shoes },
  { type: "Accessories", image: hat },
  { type: "Underwear & Socks", image: underwearSocks },
] as const satisfies readonly { type: string; image: string }[];

export type ClothingType = (typeof CLOTHING_TYPES)[number]["type"];
