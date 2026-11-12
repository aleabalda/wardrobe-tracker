import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { BlurredImage } from "../../components/ui/BlurredImage";
import { Toast } from "../../components/ui/Toast";
import { APP_NAME, LogoMark } from "../../components/Logo";
import type { ListingDetail } from "../../types/ListingItem";
import { fetchListingById, updateListingSaved } from "../../api/listings";
import { sendMessage, startConversation } from "../../api/conversations";
import { useAuth } from "../../context/AuthContext";
import { getListingStatusBadge } from "../../utils/listingStatus";
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import defaultAvatar from "../../assets/images/avatar.webp";

const DEFAULT_MESSAGE = "Hi, is this available?";

const iconButtonClass =
  "flex size-10 shrink-0 cursor-pointer items-center justify-center border border-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

export const ListingItemExpanded = () => {
  const { id } = useParams<{ id: string }>();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState<ListingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isUpdatingSaved, setIsUpdatingSaved] = useState<boolean>(false);
  const [isStartingConversation, setIsStartingConversation] =
    useState<boolean>(false);
  const [draft, setDraft] = useState<string>(DEFAULT_MESSAGE);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
  }, [id]);

  const closeToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const close = () => {
    if ((window.history.state as { idx?: number } | null)?.idx) {
      navigate(-1);
    } else {
      navigate("/listings");
    }
  };

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

  const handleSave = async () => {
    if (!item || isUpdatingSaved) return;

    const newValue = !isSaved;
    setIsSaved(newValue);
    setIsUpdatingSaved(true);

    try {
      setIsSaved(await updateListingSaved(item.id, newValue));
    } catch (error) {
      console.error("Failed to update saved listing:", error);
      // Revert optimistic update
      setIsSaved(!newValue);
    } finally {
      setIsUpdatingSaved(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastMessage("Link copied to clipboard!");
    } catch (error) {
      console.error("Unable to copy link:", error);
      setError("Unable to copy the link.");
    }
  };

  if (error && !item) {
    return <p className="p-4">{error}</p>;
  }

  if (!item) {
    return <p className="p-4">Loading item...</p>;
  }

  const statusBadge = getListingStatusBadge(item.status);
  const isOwnListing = item.seller_id === auth.userId;
  const details = [
    { label: "Brand", value: item.brand },
    { label: "Type", value: item.type },
    { label: "Size", value: item.size },
    { label: "Color", value: item.color },
  ].filter(({ value }) => value);

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden md:flex-row">
      <Toast message={toastMessage} onClose={closeToast} />

      <div className="relative h-[55dvh] shrink-0 min-w-0 bg-neutral-900 md:h-full md:flex-1">
        <BlurredImage
          src={item.image_url}
          alt={item.name}
          className="h-full w-full"
        />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <button
            type="button"
            onClick={close}
            aria-label="Close listing"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black"
          >
            <CloseIcon />
          </button>
          <Link
            to="/"
            aria-label={`${APP_NAME} home`}
            className="flex size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black"
          >
            <LogoMark className="h-5 w-auto" />
          </Link>
        </div>
      </div>

      <aside className="flex min-h-0 w-full flex-1 flex-col md:flex-none md:w-96 md:shrink-0 lg:w-md">
        <div className="flex flex-1 flex-col overflow-y-auto p-5">
          <h1 className="text-2xl font-bold leading-tight">{item.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            {item.price !== null && <p className="text-lg">${item.price}</p>}
            {statusBadge && (
              <span className="border border-black px-1.5 py-0.5 text-xs">
                {statusBadge}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Listed {formatTimeAgo(item.created_at)}
          </p>

          <div className="mt-4 flex gap-2">
            {isOwnListing ? (
              <Link
                to={`/wardrobe/${item.clothing_item_id}`}
                className="flex h-10 flex-1 items-center justify-center gap-2 border border-black bg-black text-sm text-white transition-colors hover:bg-white hover:text-black"
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
                  className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 border border-black bg-black text-sm text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChatBubbleOutlineIcon fontSize="small" />
                  {isStartingConversation ? "Opening..." : "Message"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleSave();
                  }}
                  disabled={isUpdatingSaved}
                  aria-label={
                    isSaved ? "Remove from saved listings" : "Save listing"
                  }
                  aria-pressed={isSaved}
                  title={isSaved ? "Saved" : "Save"}
                  className={iconButtonClass}
                >
                  {isSaved ? (
                    <BookmarkIcon fontSize="small" />
                  ) : (
                    <BookmarkBorderIcon fontSize="small" />
                  )}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                void handleShare();
              }}
              aria-label="Copy link to listing"
              title="Copy link"
              className={iconButtonClass}
            >
              <ShareOutlinedIcon fontSize="small" />
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <h2 className="mt-6 font-semibold">Details</h2>
          <dl className="mt-2 grid grid-cols-[6rem_1fr] gap-y-2 text-sm">
            {details.map(({ label, value }) => (
              <div key={label} className="contents">
                <dt className="font-medium">{label}</dt>
                <dd className="text-gray-700">{value}</dd>
              </div>
            ))}
          </dl>

          {item.description && (
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed">
              {item.description}
            </p>
          )}

          <section className="mt-auto pt-6">
            <h2 className="font-semibold">Seller information</h2>
            <div className="mt-3 flex items-center gap-3">
              <img
                src={item.seller_avatar_url ?? defaultAvatar}
                alt=""
                className="size-14 shrink-0 rounded-full border border-gray-200 object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {item.seller_name}
                  {isOwnListing && (
                    <span className="text-gray-500"> (you)</span>
                  )}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                  <LogoMark className="h-3 w-auto text-black" />
                  Joined {APP_NAME} in{" "}
                  {new Date(item.seller_joined_at).getFullYear()}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* sellers can't message themselves about their own listing */}
        {!isOwnListing && (
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
        )}
      </aside>
    </div>
  );
};
