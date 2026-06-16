import { useState } from "react";
import { AddItemForm } from "../../components/AddItemForm";
import AddIcon from "@mui/icons-material/Add";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SortIcon from "@mui/icons-material/Sort";

export const Wardrobe = () => {
  const [addingItem, setAddingItem] = useState<boolean>(false);

  // interface ClothingItem {
  //   name: string;
  //   description: string;
  //   brand: string;
  //   price: number;
  //   type: string;
  //   color: string;
  //   size: string;
  //   is_for_sale: boolean;
  //   image_url: string;
  // }

  // const add = () => {};
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
    </div>
  );
};
