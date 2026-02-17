import { useState } from "react";

export const AddItemForm = ({
  setAddingItem,
}: {
  setAddingItem: (value: boolean) => void;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState(0);
  const [type, setType] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [isForSale, setIsForSale] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("brand", brand);
    formData.append("price", String(price));
    formData.append("type", type);
    formData.append("color", color);
    formData.append("size", size);
    formData.append("isForSale", String(isForSale));

    try {
      const res = await fetch("http://localhost:3000/api/clothing", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to create item");
      }

      setAddingItem(false);
    } catch (err) {
      console.error(err);
      alert("Error creating clothing item");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-white p-6 rounded shadow-lg"
    >
      <h2 className="text-xl font-bold mb-4">Add New Clothing Item</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="name">Name:</label>
          <input
            className="p-2 bg-gray-100 w-full"
            type="text"
            name="name"
            placeholder="Enter item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <input
            className="p-2 bg-gray-100 w-full"
            type="text"
            name="description"
            placeholder="Enter item description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="brand">Brand:</label>
          <input
            className="p-2 bg-gray-100 w-full"
            type="text"
            name="brand"
            placeholder="Enter item brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input
            className="p-2 bg-gray-100 w-full"
            type="number"
            name="price"
            placeholder="Enter item price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="type">Type:</label>
          <input
            className="p-2 bg-gray-100 w-full"
            type="text"
            name="type"
            placeholder="Enter item type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="color">Color:</label>
          <input
            className="p-2 bg-gray-100 w-full"
            type="text"
            name="color"
            placeholder="Enter item color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="size">Size:</label>
          <input
            className="p-2 bg-gray-100 w-full"
            type="text"
            name="size"
            placeholder="Enter item size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="is_for_sale">For Sale:</label>
          <input
            type="checkbox"
            name="is_for_sale"
            checked={isForSale}
            onChange={(e) => setIsForSale(e.target.checked)}
          />
        </div>
        <div>
          <label htmlFor="clothing-item">Choose a picture:</label>

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
        <button
          type="submit"
          className="mt-6 ml-auto py-2 px-4 bg-green-300 cursor-pointer hover:bg-green-400 transition-all ease-in-out font-bold rounded"
        >
          Add Item
        </button>
        <button
          onClick={() => {
            setAddingItem(false);
          }}
          className="mt-6 ml-4 py-2 px-4 bg-red-300 cursor-pointer hover:bg-red-400 transition-all ease-in-out font-bold rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
