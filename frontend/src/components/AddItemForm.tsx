import { useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import type { ClothingItem } from "../types/ClothingItems";
import { CLOTHING_TYPES, type ClothingType } from "../types/clothingItemTypes";

type ItemClothingType = Exclude<ClothingType, "All Clothing">;

// "All Clothing" is a filter option, not a type an item can have
const ITEM_CLOTHING_TYPES = CLOTHING_TYPES.map(({ type }) => type).filter(
  (val): val is ItemClothingType => val !== "All Clothing",
);

const labelClass = "text-sm";
const inputClass =
  "w-full p-3 bg-white rounded outline-1 outline-gray-400 focus:outline-1 focus:outline-black";

export const AddItemForm = ({
  setAddingItem,
  clothingItems,
  setClothingItems,
}: {
  setAddingItem: (value: boolean) => void;
  clothingItems: ClothingItem[];
  setClothingItems: (items: ClothingItem[]) => void;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState<ItemClothingType | "">("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Please select an image");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("brand", brand);
    formData.append("type", type);
    formData.append("color", color);
    formData.append("size", size);

    try {
      const res = await fetch("http://localhost:3000/api/clothing/add", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to create item");
      }
      const newItem: ClothingItem = await res.json();
      setClothingItems([...clothingItems, newItem]);
      setAddingItem(false);
    } catch (err) {
      console.error(err);
      alert("Error creating clothing item");
    }
    setIsLoading(false);
    window.location.reload();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-10 bg-black/50"
        onClick={() => {
          setAddingItem(false);
        }}
      ></div>
      <form
        onSubmit={handleSubmit}
        className="fixed transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-20 w-xl max-w-[calc(100vw-2rem)] bg-white border border-black p-6 rounded shadow-lg flex flex-col gap-4"
      >
        <h2 className="text-lg">Add Clothing Item</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name-input" className={labelClass}>
              Name <span className="text-orange-500">*</span>
            </label>
            <input
              id="name-input"
              className={inputClass}
              type="text"
              placeholder="e.g. Linen shirt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="brand-input" className={labelClass}>
              Brand
            </label>
            <input
              id="brand-input"
              className={inputClass}
              type="text"
              placeholder="e.g. Uniqlo"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="type-input" className={labelClass}>
              Type <span className="text-orange-500">*</span>
            </label>
            <div className="relative">
              <select
                id="type-input"
                className={`${inputClass} appearance-none cursor-pointer pr-10 ${
                  type === "" ? "text-gray-400" : ""
                }`}
                required
                value={type}
                onChange={(e) => setType(e.target.value as ItemClothingType)}
              >
                <option value="" disabled>
                  Select a type
                </option>
                {ITEM_CLOTHING_TYPES.map((val) => (
                  <option key={val} value={val} className="text-black">
                    {val}
                  </option>
                ))}
              </select>
              <KeyboardArrowDownIcon
                fontSize="small"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="size-input" className={labelClass}>
              Size <span className="text-orange-500">*</span>
            </label>
            <input
              id="size-input"
              className={inputClass}
              type="text"
              placeholder="e.g. M"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="color-input" className={labelClass}>
              Color <span className="text-orange-500">*</span>
            </label>
            <input
              id="color-input"
              className={inputClass}
              type="text"
              placeholder="e.g. Navy"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="image-input" className={labelClass}>
              Image
            </label>
            <input
              id="image-input"
              className={`${inputClass} text-sm/6 text-gray-500 file:mr-3 file:cursor-pointer cursor-pointer file:text-black file:transition-all file:ease-in-out hover:file:underline`}
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="description-input" className={labelClass}>
              Description
            </label>
            <textarea
              id="description-input"
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Describe the item"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        {isLoading ? (
          <LinearProgress aria-label="Loading…" />
        ) : (
          <div className="flex gap-4">
            <button
              type="submit"
              className="cursor-pointer hover:underline text-sm"
            >
              Add Item
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingItem(false);
              }}
              className="cursor-pointer underline text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </>
  );
};
