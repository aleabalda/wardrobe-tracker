import foldingClothes from "../../assets/images/foldingClothes.jpg";

export const MainFeatureSection = () => {
  return (
    <section className="flex items-center p-20 gap-10 h-dvh max-h-[800px]">
      <img
        src={foldingClothes}
        alt="individual folding clothes"
        className="w-1/2 rounded object-cover shadow-lg"
      />
      <div className="flex flex-col gap-4 w-1/2">
        <h2 className="font-bold text-4xl">Your Wardrobe, Reimagined.</h2>
        <p className="font-semibold text-xl mb-5">
          A smarter way to organize, personalize, and rediscover your style.
        </p>
        <p className="text-lg">
          Wardrobe.io transforms the way you interact with your closet. Easily
          create your digital wardrobe by adding the pieces you own, from
          everyday essentials to statement fits, all in one place. Tag items by
          color, category, or season to keep your style organized and accessible
          wherever you are. Update your collection as your style evolves: add
          new items, edit details, or remove pieces you no longer wear with a
          single click. Whether you’re planning outfits for the week or
          cataloging your favorite looks, Wardrobe.io helps you see your style
          from a new perspective — clean, organized, and uniquely yours.
        </p>
        <button className="w-fit p-4 bg-amber-500 rounded-lg shadow-md font-bold hover:bg-amber-600 hover:cursor-pointer transition-all ease-in-out duration-150 mt-2">
          Add To Your Wardrobe
        </button>
      </div>
    </section>
  );
};
