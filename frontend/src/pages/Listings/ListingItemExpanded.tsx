import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BlurredImage } from "../../components/ui/BlurredImage";

import type { ListingItem } from "../../types/ListingItem";
import { fetchListingById } from "../../api/listings";

// read-only view of another user's listing, so no edit/delete/outfit actions
export const ListingItemExpanded = () => {
  const { id } = useParams<{ id: string }>();

  const [item, setItem] = useState<ListingItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No listing ID was provided.");
      return;
    }

    const loadItem = async () => {
      try {
        setError(null);

        const listing = await fetchListingById(id);
        setItem(listing);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unable to load listing.",
        );
      }
    };

    void loadItem();
  }, [id]);

  if (error && !item) {
    return <p className="p-4">{error}</p>;
  }

  if (!item) {
    return <p className="p-4">Loading item...</p>;
  }

  return (
    <div className="flex h-full gap-3 p-4">
      <BlurredImage
        src={item.image_url}
        alt={item.name}
        className="h-full w-2/3 shadow-xl"
      />
      <div className="relative flex h-full w-1/3 flex-col gap-2">
        {/* Follow facebook marketplace format */}
        <h1 className="text-2xl font-bold">{item.name}</h1>
        <h2 className="font-semibold">Details</h2>
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <p>Brand: {item.brand}</p>
          <p>Type: {item.type}</p>
          <p>Color: {item.color}</p>
          <p>Size: {item.size}</p>
        </div>

        <p className="">{item.description}</p>

        {item.price !== null && <p>${item.price}</p>}
      </div>
    </div>
  );
};
