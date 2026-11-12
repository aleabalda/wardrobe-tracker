// import base images for each clothing type here, e.g.
// import topsImage from "../assets/images/tops.jpg";
import coat from "../assets/images/coat.jpeg";
import shirt from "../assets/images/tshirt.jpeg";
import jacket from "../assets/images/jacket.jpeg";
import sweater from "../assets/images/sweater.jpeg";
import jeans from "../assets/images/bottoms.jpeg";
import shoes from "../assets/images/shoes.jpeg";
import dress from "../assets/images/dress.jpeg";
import underwearSocks from "../assets/images/socks.jpeg";
import hat from "../assets/images/accessory.jpeg";
import outfit from "../assets/images/allClothing.jpeg";

export const CLOTHING_TYPES = [
  { type: "All Clothing", image: outfit },
  { type: "T-Shirts", image: shirt },
  { type: "Sweaters", image: sweater },
  { type: "Jackets", image: jacket },
  { type: "Coats", image: coat },
  { type: "Bottoms", image: jeans },
  { type: "Dresses & Jumpsuits", image: dress },
  { type: "Shoes", image: shoes },
  { type: "Accessories", image: hat },
  { type: "Underwear & Socks", image: underwearSocks },
] as const satisfies readonly { type: string; image: string }[];

export type ClothingType = (typeof CLOTHING_TYPES)[number]["type"];
