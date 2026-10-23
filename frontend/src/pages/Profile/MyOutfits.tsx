import { useEffect, useState } from "react";
import { OutfitCard } from "../../components/OutfitCard";
import { fetchOutfits } from "../../api/outfits";
import type { Outfit } from "../../types/Outfit";

export const MyOutfits = () => {
  const [favouriteOutfits, setFavouriteOutfits] = useState<Outfit[]>([]);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const outfits = await fetchOutfits(true);
        setFavouriteOutfits(outfits);
      } catch (error) {
        console.error("Unable to load favourite outfits:", error);
      }
    };

    void fetchFavourites();
  }, []);

  return (
    <div className="pl-8">
      <h2 className="text-xl font-semibold mb-2">Outfits</h2>

      {favouriteOutfits.length === 0 ? (
        <p className="mt-4 text-gray-500">No favourite outfits yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {favouriteOutfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      )}
    </div>
  );
};
