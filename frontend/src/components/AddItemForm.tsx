import { useState } from "react";
import { motion } from "motion/react";
import type { ClothingItem } from "../types/ClothingItems";
import { CLOTHING_TYPES, type ClothingType } from "../types/clothingItemTypes";
import {
  FileField,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "./ui/FormField";

type ItemClothingType = Exclude<ClothingType, "All Clothing">;

// "All Clothing" is a filter option, not a type an item can have
const ITEM_CLOTHING_TYPES = CLOTHING_TYPES.map(({ type }) => type).filter(
  (val): val is ItemClothingType => val !== "All Clothing",
);

export const AddItemForm = ({
  onClose,
  clothingItems,
  setClothingItems,
}: {
  onClose: () => void;
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
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error creating clothing item");
    } finally {
      setIsLoading(false);
    }
  };

  // stays open during an upload so it can't be dismissed halfway through
  const handleClose = () => {
    if (!isLoading) onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={handleClose}
        className="fixed inset-0 z-30 bg-black/50"
      />
      <motion.form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Escape") handleClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-item-title"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-y-0 right-0 z-40 flex w-122 max-w-full flex-col bg-white shadow-xl"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <h2 id="add-item-title" className="text-base">
            Add Clothing Item
          </h2>
          {!isLoading && (
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer text-sm underline"
            >
              Cancel
            </button>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-2">
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Name"
              hint="e.g. Linen shirt"
              className="col-span-2"
              type="text"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Brand"
              hint="e.g. Uniqlo"
              optional
              className="col-span-2"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
            <SelectField
              label="Type"
              required
              value={type}
              onChange={(e) => setType(e.target.value as ItemClothingType)}
            >
              {ITEM_CLOTHING_TYPES.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Size"
              hint="e.g. M"
              type="text"
              required
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
            <TextField
              label="Color"
              hint="e.g. Navy"
              className="col-span-2"
              type="text"
              required
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <FileField
              label="Image"
              fileName={imageFile?.name}
              className="col-span-2"
              accept="image/png, image/jpeg"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />
            <TextAreaField
              label="Description"
              hint="Describe the item"
              optional
              className="col-span-2"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="px-6 py-4">
          <SubmitButton disabled={isLoading}>
            {isLoading ? "Adding Item..." : "Add Item"}
          </SubmitButton>
        </div>
      </motion.form>
    </>
  );
};
