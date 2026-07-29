import { useEffect } from "react";
import { fetchAllListings } from "../../api/listings";

export const Listings = () => {
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listings = await fetchAllListings();
        console.log(listings);
      } catch (error) {
        console.error("Unable to load listings:", error);
      }
    };

    void fetchListings();
  }, []);

  return (
    <div className="p-4">
      {/* <div>
        {listings.length === 0 ? (
          <p className="mt-4 text-gray-500">No clothing items found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
            {listings.map((item) => (
              <ClothingItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
};
