import { useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import type { ClothingItem } from "../types/ClothingItems";

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
  const [type, setType] = useState("");
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
    <form
      onSubmit={handleSubmit}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-white p-6 border-black border rounded shadow-lg"
    >
      <h2 className="text-xl font-bold mb-4">Add New Clothing Item</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="hidden">
            Name:
          </label>
          <input
            className="p-3 outline-1 outline-gray-400 rounded w-full"
            type="text"
            name="name"
            placeholder="Enter item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="description" className="hidden">
            Description:
          </label>
          <input
            className="p-3 w-full rounded outline-1 outline-gray-400"
            type="text"
            name="description"
            placeholder="Enter item description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="brand" className="hidden">
            Brand:
          </label>
          <input
            className="p-3 w-full rounded outline-1 outline-gray-400"
            type="text"
            name="brand"
            placeholder="Enter item brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="type" className="hidden">
            Type:
          </label>
          <input
            className="p-3 w-full rounded outline-1 outline-gray-400"
            type="text"
            name="type"
            placeholder="Enter item type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="color" className="hidden">
            Color:
          </label>
          <input
            className="p-3 w-full rounded outline-1 outline-gray-400"
            type="text"
            name="color"
            placeholder="Enter item color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="size" className="hidden">
            Size:
          </label>
          <input
            className="p-3 w-full rounded outline-1 outline-gray-400"
            type="text"
            name="size"
            placeholder="Enter item size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="clothing-item" className="hidden">
            Choose a picture:
          </label>
          <input
            type="file"
            id="clothing-item"
            name="image"
            accept="image/png, image/jpeg"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setImageFile(e.target.files[0]);
              }
            }}
          />
        </div>
      </div>
      <div>
        {isLoading ? (
          <div className="mt-6">
            <LinearProgress aria-label="Loading…" />
          </div>
        ) : (
          <>
            <button
              type="submit"
              className="mt-6 ml-auto py-2 px-4 bg-black text-white cursor-pointer font-bold rounded"
            >
              Add Item
            </button>
            <button
              onClick={() => {
                setAddingItem(false);
              }}
              className="mt-6 ml-4 py-2 px-4 outline-1 outline-black cursor-pointer font-bold rounded"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </form>
  );
};
