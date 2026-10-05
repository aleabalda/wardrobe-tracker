import { useEffect, useState } from "react";
import { fetchAllListings } from "../../api/listings";
import type { ListingItem } from "../../types/ListingItem";
import { ListingItemCard } from "../../components/ListingItemCard";
import { useAuth } from "../../context/AuthContext";

export const Listings = () => {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isShopping, setIsShopping] = useState<boolean>(true);
  const { auth } = useAuth();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const result = await fetchAllListings();
        console.log(result);
        setListings(result);
      } catch (error) {
        console.error("Unable to load listings:", error);
      }
    };

    void fetchListings();
  }, []);

  // shopping shows other users' listings, selling shows the user's own
  const filteredListings = listings.filter((item) =>
    isShopping ? item.seller_id !== auth.userId : item.seller_id === auth.userId,
  );

  return (
    <div className="p-12">
      <div className="mb-10">
        <h2 className="text-4xl font-semibold mb-2">All Listings</h2>
        {/* include code here to display all types of clothes (jackets, jeans, t-shirts, dresses, etc.) */}
      </div>
      <div className="mb-2">
        <ul className="flex gap-4">
          <li
            onClick={() => {
              setIsShopping(!isShopping);
            }}
            className={`font-semibold cursor-pointer ${isShopping ? `underline` : ``}`}
          >
            Shop
          </li>
          <li
            onClick={() => {
              setIsShopping(!isShopping);
            }}
            className={`font-semibold cursor-pointer ${isShopping ? `` : `underline`}`}
          >
            Sell
          </li>
        </ul>
      </div>
      <div className="w-full h-0.5 rounded bg-black"></div>
      <div>
        {filteredListings.length === 0 ? (
          <p className="mt-4 text-gray-500">No listings found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {filteredListings.map((item) => (
              <ListingItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
