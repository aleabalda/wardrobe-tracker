import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { ClothingItem } from "../../types/ClothingItems";
import { useNavigate } from "react-router-dom";

export const ClothingItemExpanded = () => {
  const { id } = useParams();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!id) return;

    try {
      const res = await fetch(`http://localhost:3000/api/clothing/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete clothing item");
      }
      window.alert(res.statusText);
      navigate("/wardrobe");
      // Redirect to the wardrobe page after deletion
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        console.log(`Fetching clothing item with id: ${id}`);
        const res = await fetch(`http://localhost:3000/api/clothing/${id}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch clothing item");
        }

        const data = await res.json();
        setItem(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (id) fetchItem();
  }, [id]);

  if (!item) {
    return <p className="p-4">Loading item...</p>;
  }

  return (
    <div className="flex h-dvh gap-4 p-4">
      <img
        src={item.image_url}
        alt={item.name}
        className="w-1/2 h-full rounded object-cover"
      />

      <div className="w-1/2 flex flex-col gap-2 relative">
        <h1 className="text-5xl font-bold">{item.name}</h1>
        <p className="text-xl">
          {item.brand} | {item.type} | {item.color} | Size {item.size}
        </p>
        <p>{item.description}</p>
        {item.price !== null && <p>${item.price}</p>}
        <div className="flex gap-2 absolute bottom-1 left-0 ">
          <button className="bg-blue-300 py-2 px-4 rounded font-semibold cursor-pointer hover:bg-blue-400 transition-all ease-in-out">
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-300 py-2 px-4 rounded font-semibold cursor-pointer hover:bg-red-400 transition-all ease-in-out"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
