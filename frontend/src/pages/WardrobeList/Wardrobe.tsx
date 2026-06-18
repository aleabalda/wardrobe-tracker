import { useEffect, useState } from "react";
import { AddItemForm } from "../../components/AddItemForm";
import AddIcon from "@mui/icons-material/Add";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SortIcon from "@mui/icons-material/Sort";

interface ClothingItem {
  id: number;
  name: string;
  description: string;
  brand: string;
  type: string;
  color: string;
  size: string;
  price: number | null;
  is_for_sale: boolean;
  image_url: string;
}

export const Wardrobe = () => {
  const [addingItem, setAddingItem] = useState<boolean>(false);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);

  useEffect(() => {
    // Fetch clothing items from the backend when the component mounts
    const fetchClothingItems = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/clothing/get", {
          credentials: "include",
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch clothing items");
        }

        const data = await res.json();
        console.log("Fetched clothing items:", data);
        setClothingItems(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchClothingItems();
  }, []);

  return (
    <div className="p-4">
      <div className="flex gap-4 items-center">
        <button
          onClick={() => {
            setAddingItem(true);
          }}
          className="border-amber-300 border-2 py-2 px-4 rounded hover:bg-amber-300 cursor-pointer transition-all ease-in-out"
        >
          <AddIcon />
        </button>
        <button className="border-amber-300 border-2 py-2 px-4 rounded hover:bg-amber-300 cursor-pointer transition-all ease-in-out">
          <FilterAltIcon />
        </button>
        <button className="border-amber-300 border-2 py-2 px-4 rounded hover:bg-amber-300 cursor-pointer transition-all ease-in-out">
          <SortIcon />
        </button>
      </div>
      {addingItem && <AddItemForm setAddingItem={setAddingItem} />}
      <div>
        {clothingItems.length === 0 ? (
          <p className="mt-4 text-gray-500">No clothing items found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {clothingItems.map((item) => (
              <div
                key={item.id}
                className="border rounded overflow-hidden shadow hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-2">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.brand}</p>
                  <p className="text-sm text-gray-600">{item.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
