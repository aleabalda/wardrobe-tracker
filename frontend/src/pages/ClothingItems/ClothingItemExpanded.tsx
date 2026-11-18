import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreateListingForm } from "../../components/CreateListingForm";
import {
  ActionRow,
  SaveButton,
  ShareButton,
} from "../../components/expanded/ActionButtons";
import { primaryButtonClass } from "../../components/expanded/expandedStyles";
import { useSavedToggle } from "../../components/expanded/useSavedToggle";
import { ExpandedLayout } from "../../components/expanded/ExpandedLayout";
import { ItemDetails, ItemHeader } from "../../components/expanded/ItemSummary";
import { OwnerInfo } from "../../components/expanded/OwnerInfo";
import { Toast } from "../../components/ui/Toast";
import { fetchClothingItemById, updateFavourite } from "../../api/wardrobe";
import { fetchUserDetails } from "../../api/user";
import type { UserDetails } from "../../types/UserDetails";
import type { ClothingItem } from "../../types/ClothingItems";
import { getListingStatusBadge } from "../../utils/listingStatus";
import { ItemFooter } from "./expanded/ItemFooter";
import { ListingStatusControl } from "./expanded/ListingStatusControl";
import {
  RecentOutfitsSection,
  SimilarItemsSection,
} from "./expanded/RelatedSections";
import { useRelatedItems } from "./expanded/useRelatedItems";

export const ClothingItemExpanded = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<ClothingItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isListingItem, setIsListingItem] = useState<boolean>(false);
  const [owner, setOwner] = useState<UserDetails | null>(null);
  const { recentOutfits, similarItems } = useRelatedItems(item);
  const saved = useSavedToggle((isSaved) => {
    if (!item) return Promise.resolve(isSaved);
    return updateFavourite(item.id, isSaved);
  });
  const { setIsSaved } = saved;

  useEffect(() => {
    if (!id) {
      setError("No clothing item ID was provided.");
      return;
    }

    const loadItem = async () => {
      try {
        setError(null);

        const clothingItem = await fetchClothingItemById(id);
        setItem(clothingItem);
        setIsSaved(Boolean(clothingItem.is_favourite));
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load clothing item.",
        );
      }
    };

    void loadItem();
  }, [id, setIsSaved]);

  // items can only be opened by their owner, so that's always the signed-in
  // user; if this fails the section is just left out
  useEffect(() => {
    fetchUserDetails().then(setOwner, (error: unknown) => {
      console.error("Unable to load user details:", error);
    });
  }, []);

  const closeToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  if (error && !item) {
    return <p className="p-4">{error}</p>;
  }

  if (!item) {
    return <p className="p-4">Loading item...</p>;
  }

  return (
    <ExpandedLayout
      imageUrl={item.image_url}
      imageAlt={item.name}
      closeLabel="Close item"
      fallbackPath="/wardrobe"
      overlays={
        <>
          <Toast message={toastMessage} onClose={closeToast} />
          {isListingItem && (
            <CreateListingForm
              clothingItem={item}
              toggleForm={() => {
                setIsListingItem(false);
              }}
              editError={setError}
              onListingCreated={(description, listingId) => {
                setItem({
                  ...item,
                  description,
                  is_for_sale: true,
                  listing_id: listingId,
                  listing_status: "active",
                });
              }}
            />
          )}
        </>
      }
      footer={
        <ItemFooter
          itemId={item.id}
          canList={!item.listing_id && !item.is_for_sale}
          onList={() => {
            setIsListingItem(true);
          }}
        />
      }
    >
      <ItemHeader
        name={item.name}
        price={item.price}
        badge={
          item.listing_status
            ? getListingStatusBadge(item.listing_status)
            : undefined
        }
      />

      <ActionRow>
        <button
          type="button"
          onClick={() => {
            navigate("/outfits/create-outfit", { state: { itemId: item.id } });
          }}
          className={primaryButtonClass}
        >
          Create Outfit
        </button>
        <SaveButton
          noun="item"
          isSaved={saved.isSaved}
          isUpdating={saved.isUpdating}
          onToggle={() => {
            void saved.toggle();
          }}
        />
        <ShareButton
          noun="item"
          onCopied={() => {
            setToastMessage("Link copied to clipboard!");
          }}
          onError={() => {
            setError("Unable to copy the link.");
          }}
        />
      </ActionRow>

      {item.listing_id && item.listing_status ? (
        <ListingStatusControl
          listingId={item.listing_id}
          status={item.listing_status}
          onStatusChange={(status) => {
            setItem({ ...item, listing_status: status });
          }}
          onError={setError}
        />
      ) : (
        Boolean(item.is_for_sale) && (
          <p className="mt-3 text-sm text-gray-500">Listed for sale</p>
        )
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <ItemDetails item={item} />
      <RecentOutfitsSection outfits={recentOutfits} />
      <SimilarItemsSection items={similarItems} />

      {owner && (
        <OwnerInfo
          title="Owner information"
          name={owner.username || owner.first_name || "User"}
          avatarUrl={owner.avatar_url}
          joinedAt={owner.created_at}
          isYou
        />
      )}
    </ExpandedLayout>
  );
};
