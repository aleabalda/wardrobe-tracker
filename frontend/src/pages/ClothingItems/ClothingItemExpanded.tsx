import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreateListingForm } from "../../components/expanded/edit/CreateListingForm";
import { ArchiveItemForm } from "../../components/expanded/edit/ArchiveItemForm";
import { DeleteItemForm } from "../../components/expanded/edit/DeleteItemForm";
import { EditItemForm } from "../../components/expanded/edit/EditItemForm";
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
import {
  fetchClothingItemById,
  restoreClothingItem,
  updateFavourite,
} from "../../api/wardrobe";
import { fetchUserDetails } from "../../api/user";
import type { UserDetails } from "../../types/UserDetails";
import type { ClothingItem } from "../../types/ClothingItems";
import { getListingStatusBadge } from "../../utils/listingStatus";
import { getArchiveLabel } from "../../utils/archiveReasons";
import { ItemFooter } from "./expanded/ItemFooter";
import { ListingSummary } from "./expanded/ListingSummary";
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
  // which form, if any, has taken over the side panel
  const [panelMode, setPanelMode] = useState<
    "edit" | "list" | "archive" | "delete" | null
  >(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const closePanel = () => {
    setPanelMode(null);
  };
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

  const handleRestore = async () => {
    if (!item || isRestoring) return;

    try {
      setIsRestoring(true);
      setError(null);
      setItem(await restoreClothingItem(item.id));
      setToastMessage("Restored to your wardrobe");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to restore item.",
      );
    } finally {
      setIsRestoring(false);
    }
  };

  if (error && !item) {
    return <p className="p-4">{error}</p>;
  }

  if (!item) {
    return <p className="p-4">Loading item...</p>;
  }

  const isArchived = item.archived_at !== null;

  return (
    <ExpandedLayout
      imageUrl={item.image_url}
      imageAlt={item.name}
      closeLabel="Close item"
      closePath={isArchived ? "/wardrobe?view=past" : "/wardrobe"}
      overlays={
        <>
          <Toast message={toastMessage} onClose={closeToast} />
        </>
      }
      panel={
        panelMode === "edit" ? (
          <EditItemForm
            item={item}
            onClose={closePanel}
            onSaved={(updated) => {
              setItem(updated);
              closePanel();
              setToastMessage("Changes saved");
            }}
          />
        ) : panelMode === "list" ? (
          <CreateListingForm
            item={item}
            onClose={closePanel}
            onCreated={(listingId) => {
              setItem({
                ...item,
                is_for_sale: true,
                listing_id: listingId,
                listing_status: "active",
              });
              closePanel();
              setToastMessage("Item listed for sale");
            }}
          />
        ) : panelMode === "archive" ? (
          <ArchiveItemForm
            item={item}
            onClose={closePanel}
            onArchived={(updated) => {
              setItem(updated);
              closePanel();
              setToastMessage("Moved to past items");
            }}
          />
        ) : panelMode === "delete" ? (
          <DeleteItemForm item={item} onClose={closePanel} />
        ) : undefined
      }
      footer={
        <ItemFooter
          isArchived={isArchived}
          canList={!item.listing_id && !item.is_for_sale}
          isRestoring={isRestoring}
          onList={() => {
            setPanelMode("list");
          }}
          onEdit={() => {
            setPanelMode("edit");
          }}
          onArchive={() => {
            setPanelMode("archive");
          }}
          onRestore={() => {
            void handleRestore();
          }}
          onDelete={() => {
            setPanelMode("delete");
          }}
        />
      }
    >
      <ItemHeader
        name={item.name}
        price={item.price}
        badge={
          isArchived
            ? getArchiveLabel(item.archive_reason)
            : item.listing_status
              ? getListingStatusBadge(item.listing_status)
              : undefined
        }
      />

      {item.archived_at && (
        <p className="mt-3 bg-gray-100 px-3 py-2 text-sm leading-relaxed">
          {item.archive_reason === "other" || !item.archive_reason
            ? "Removed from your wardrobe"
            : getArchiveLabel(item.archive_reason)}{" "}
          on{" "}
          {new Date(item.archived_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          . It's kept in your outfits, but is no longer in your wardrobe.
        </p>
      )}

      <ActionRow>
        {!isArchived && (
          <button
            type="button"
            onClick={() => {
              navigate("/outfits/create-outfit", {
                state: { itemId: item.id },
              });
            }}
            className={primaryButtonClass}
          >
            Create Outfit
          </button>
        )}
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

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <ItemDetails item={item} />

      {item.listing_id && item.listing_status ? (
        <ListingSummary
          listingId={item.listing_id}
          status={item.listing_status}
        />
      ) : (
        Boolean(item.is_for_sale) && (
          <p className="mt-6 text-sm text-gray-500">Listed for sale</p>
        )
      )}

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
