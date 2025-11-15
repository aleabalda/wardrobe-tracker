import messyClothes from "../../assets/images/messyClothes.jpg";
import { motion } from "motion/react";

export const SecondaryFeatureSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, translateY: 60 }}
      whileInView={{ opacity: 1, translateY: 0, transition: { duration: 1.5 } }}
      className="flex items-center p-14 gap-10 max-h-[800px]"
    >
      <div className="flex flex-col gap-4 w-1/2">
        <h2 className="font-bold text-4xl">Style Worth Sharing</h2>
        <p className="font-semibold text-xl mb-5">
          Discover what real people are selling, and let others discover your
          style.
        </p>
        <p className="text-lg">
          Your wardrobe isn’t just storage, it’s an expression of who you are.
          Wardrobe.io lets you share that expression with others by turning your
          closet into a curated storefront. Post pieces you’ve outgrown, shop
          items from wardrobes you admire, and be part of a community built on
          individuality and self-expression.
        </p>
        <button className="w-fit p-4 bg-amber-500 rounded-lg shadow-md font-bold hover:bg-amber-600 hover:cursor-pointer transition-all ease-in-out duration-150 mt-2">
          List An Item Now.
        </button>
      </div>
      <img
        src={messyClothes}
        alt="individual folding clothes"
        className="w-1/2 rounded object-cover shadow-lg h-[450px]"
      />
    </motion.section>
  );
};
