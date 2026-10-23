import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BlurredImage } from "../../components/ui/BlurredImage";

import type { ListingItem } from "../../types/ListingItem";
import { fetchListingById } from "../../api/listings";
import { startConversation } from "../../api/conversations";
import { useAuth } from "../../context/AuthContext";

// read-only view of another user's listing, so no edit/delete/outfit actions
export const ListingItemExpanded = () => {
  const { id } = useParams<{ id: string }>();

  const [item, setItem] = useState<ListingItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStartingConversation, setIsStartingConversation] =
    useState<boolean>(false);
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setError("No listing ID was provided.");
      return;
    }

    const loadItem = async () => {
      try {
        setError(null);

        const listing = await fetchListingById(id);
        setItem(listing);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unable to load listing.",
        );
      }
    };

    void loadItem();
  }, [id]);

  const handleMessage = async () => {
    if (!item || isStartingConversation) return;

    try {
      setIsStartingConversation(true);
      setError(null);

      const conversation = await startConversation(item.id);
      navigate(`/profile/messages/${conversation.id}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to message seller.",
      );
      setIsStartingConversation(false);
    }
  };

  if (error && !item) {
    return <p className="p-4">{error}</p>;
  }

  if (!item) {
    return <p className="p-4">Loading item...</p>;
  }

  return (
    <div className="flex h-full gap-3 p-4">
      <BlurredImage
        src={item.image_url}
        alt={item.name}
        className="h-full w-2/3 shadow-xl"
      />
      <div className="relative flex h-full w-1/3 flex-col gap-2">
        {/* Follow facebook marketplace format */}
        <h1 className="text-2xl font-bold">{item.name}</h1>
        <h2 className="font-semibold">Details</h2>
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <p>Brand: {item.brand}</p>
          <p>Type: {item.type}</p>
          <p>Color: {item.color}</p>
          <p>Size: {item.size}</p>
        </div>

        <p className="">{item.description}</p>

        {item.price !== null && <p>${item.price}</p>}

        {error && <p className="text-red-600">{error}</p>}

        {/* sellers can't message themselves about their own listing */}
        {item.seller_id !== auth.userId && (
          <div className="absolute bottom-0 left-0 flex gap-4">
            <button
              type="button"
              onClick={() => {
                void handleMessage();
              }}
              disabled={isStartingConversation}
              className="cursor-pointer text-sm underline"
            >
              {isStartingConversation ? "Opening..." : "Message"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
