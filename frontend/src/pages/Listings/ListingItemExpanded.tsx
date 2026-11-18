import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
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
import type { ListingDetail } from "../../types/ListingItem";
import { fetchListingById, updateListingSaved } from "../../api/listings";
import { sendMessage, startConversation } from "../../api/conversations";
import { useAuth } from "../../context/AuthContext";
import { getListingStatusBadge } from "../../utils/listingStatus";
import { formatTimeAgo } from "../../utils/formatTimeAgo";

const DEFAULT_MESSAGE = "Hi, is this available?";

export const ListingItemExpanded = () => {
  const { id } = useParams<{ id: string }>();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState<ListingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStartingConversation, setIsStartingConversation] =
    useState<boolean>(false);
  const [draft, setDraft] = useState<string>(DEFAULT_MESSAGE);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const saved = useSavedToggle((isSaved) => {
    if (!item) return Promise.resolve(isSaved);
    return updateListingSaved(item.id, isSaved);
  });
  const { setIsSaved } = saved;

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
        setIsSaved(Boolean(listing.is_saved));
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unable to load listing.",
        );
      }
    };

    void loadItem();
  }, [id, setIsSaved]);

  const closeToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const handleMessage = async () => {
    if (!item || isStartingConversation) return;

    try {
      setIsStartingConversation(true);
      setError(null);

      const conversation = await startConversation(item.id);
      navigate(`/messages/${conversation.id}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to message seller.",
      );
      setIsStartingConversation(false);
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!item || !body || isSending) return;

    try {
      setIsSending(true);
      setError(null);

      const conversation = await startConversation(item.id);
      await sendMessage(conversation.id, body);
      navigate(`/messages/${conversation.id}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to send message.",
      );
      setIsSending(false);
    }
  };

  if (error && !item) {
    return <p className="p-4">{error}</p>;
  }

  if (!item) {
    return <p className="p-4">Loading item...</p>;
  }

  const isOwnListing = item.seller_id === auth.userId;

  return (
    <ExpandedLayout
      imageUrl={item.image_url}
      imageAlt={item.name}
      closeLabel="Close listing"
      fallbackPath="/listings"
      overlays={<Toast message={toastMessage} onClose={closeToast} />}
      footer={
        // sellers can't message themselves about their own listing
        !isOwnListing && (
          <form
            onSubmit={(e) => {
              void handleSend(e);
            }}
            className="border-t border-gray-200 p-5"
          >
            <label
              htmlFor="seller-message"
              className="flex items-center gap-2 text-sm"
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
              Send seller a message
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="seller-message"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                }}
                className="h-10 min-w-0 flex-1 border border-black px-3 text-sm outline-none focus:ring-1 focus:ring-black"
              />
              <button
                type="submit"
                disabled={isSending || !draft.trim()}
                className="h-10 cursor-pointer border border-black bg-black px-4 text-sm text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        )
      }
    >
      <ItemHeader
        name={item.name}
        price={item.price}
        badge={getListingStatusBadge(item.status)}
      >
        <p className="mt-1 text-xs text-gray-500">
          Listed {formatTimeAgo(item.created_at)}
        </p>
      </ItemHeader>

      <ActionRow>
        {isOwnListing ? (
          <Link
            to={`/wardrobe/${item.clothing_item_id}`}
            className={primaryButtonClass}
          >
            Manage listing
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                void handleMessage();
              }}
              disabled={isStartingConversation}
              className={primaryButtonClass}
            >
              <ChatBubbleOutlineIcon fontSize="small" />
              {isStartingConversation ? "Opening..." : "Message"}
            </button>
            <SaveButton
              noun="listing"
              isSaved={saved.isSaved}
              isUpdating={saved.isUpdating}
              onToggle={() => {
                void saved.toggle();
              }}
            />
          </>
        )}
        <ShareButton
          noun="listing"
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

      <OwnerInfo
        title="Seller information"
        name={item.seller_name}
        avatarUrl={item.seller_avatar_url}
        joinedAt={item.seller_joined_at}
        isYou={isOwnListing}
      />
    </ExpandedLayout>
  );
};
