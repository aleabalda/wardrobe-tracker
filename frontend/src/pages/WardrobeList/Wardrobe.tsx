import { useState } from "react";
import { AddItemForm } from "../../components/AddItemForm";

export const Wardrobe = () => {
  const [addingItem, setAddingItem] = useState<boolean>(false);

  interface ClothingItem {
    name: string;
    description: string;
    brand: string;
    price: number;
    type: string;
    color: string;
    size: string;
    is_for_sale: boolean;
    image_url: string;
  }

  const add = () => {};
  return (
    <div className="p-4">
      <div className="flex gap-4 items-center">
        <button
          onClick={() => {
            setAddingItem(true);
          }}
          className="bg-amber-200 py-2 px-4 rounded hover:bg-amber-300 cursor-pointer transition-all ease-in-out"
        >
          Add
        </button>
        <button className="bg-amber-200 py-2 px-4 rounded hover:bg-amber-300 cursor-pointer transition-all ease-in-out">
          Filter
        </button>
        <button className="bg-amber-200 py-2 px-4 rounded hover:bg-amber-300 cursor-pointer transition-all ease-in-out">
          Sort
        </button>
      </div>
      {addingItem && <AddItemForm setAddingItem={setAddingItem} />}
    </div>
  );
};
