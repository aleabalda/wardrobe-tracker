import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchConversations } from "../../api/conversations";
import { SortMenu } from "../../components/SortMenu";
import { useSocket } from "../../context/SocketContext";
import type { Conversation } from "../../types/Conversation";
import { formatMessageDate } from "../../utils/formatMessageTime";
import {
  LISTING_STATUSES,
  getListingStatusBadge,
} from "../../utils/listingStatus";
import { ConversationThread } from "./ConversationThread";

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest" },
  ...LISTING_STATUSES,
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

// conversations nobody has written in yet fall back to when they were started
const lastActivity = ({ last_message_at, updated_at }: Conversation) =>
  new Date(last_message_at ?? updated_at).getTime();

// sorting by a status brings those listings to the top, most recent first
const compareConversations = (
  a: Conversation,
  b: Conversation,
  sort: SortOption,
) => {
  const byRecency = lastActivity(b) - lastActivity(a);

  if (sort === "recent") return byRecency;
  if (sort === "oldest") return -byRecency;

  return (
    Number(b.listing_status === sort) - Number(a.listing_status === sort) ||
    byRecency
  );
};

// e.g. "Sold · Aritzia · Size M · $40.00"
const formatItemDetails = ({
  listing_status,
  brand,
  size,
  price,
}: Conversation) =>
  [
    getListingStatusBadge(listing_status),
    brand,
    size && `Size ${size}`,
    price !== null && `$${price}`,
  ]
    .filter(Boolean)
    .join(" · ");

export const Messages = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const socket = useSocket();

  const loadConversations = useCallback(async () => {
    try {
      const result = await fetchConversations();
      setConversations(result);
      setError(null);
    } catch (error) {
      console.error("Unable to load conversations:", error);
      setError("Unable to load your messages.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  // any new message (sent or received) changes previews, ordering and unread
  // counts, reading a conversation (in any tab) clears its unread count, and
  // reconnecting catches up on anything missed while the connection was down
  useEffect(() => {
    if (!socket) return;

    const refresh = () => {
      void loadConversations();
    };

    socket.on("message:new", refresh);
    socket.on("conversation:read", refresh);
    socket.io.on("reconnect", refresh);

    return () => {
      socket.off("message:new", refresh);
      socket.off("conversation:read", refresh);
      socket.io.off("reconnect", refresh);
    };
  }, [socket, loadConversations]);

  const activeId = conversationId ? Number(conversationId) : null;

  const sortedConversations = [...conversations].sort((a, b) =>
    compareConversations(a, b, sortOption),
  );

  return (
    <div className="flex h-page flex-col px-12 pb-12 pt-6">
      <h2 className="mb-4 text-5xl">Messages</h2>

      {/* it sorts the list, which small screens hide while a thread is open */}
      <div className={`mb-8 md:block ${activeId !== null ? "hidden" : ""}`}>
        <SortMenu
          options={SORT_OPTIONS}
          value={sortOption}
          onChange={setSortOption}
          panelClassName="left-0"
        />
      </div>

      <div className="flex min-h-0 flex-1 gap-16">
        {/* small screens show one pane at a time: the list, or the open thread */}
        <ul
          className={`w-full shrink-0 space-y-10 overflow-y-auto md:block md:w-96 ${
            activeId !== null ? "hidden" : ""
          }`}
        >
          {isLoading ? (
            <li className="text-sm text-gray-500">Loading messages...</li>
          ) : error && conversations.length === 0 ? (
            <li className="text-sm text-red-600">{error}</li>
          ) : conversations.length === 0 ? (
            <li className="text-sm text-gray-500">
              No conversations yet. Message a seller from a listing to start
              one.
            </li>
          ) : (
            sortedConversations.map((conversation) => {
              const isActive = conversation.id === activeId;
              // the open conversation is being read, so it's never shown as
              // unread even before the server confirms it
              const isUnread = conversation.unread_count > 0 && !isActive;
              const itemDetails = formatItemDetails(conversation);

              return (
                <li key={conversation.id}>
                  <Link
                    to={`/messages/${conversation.id}`}
                    aria-current={isActive ? "page" : undefined}
                    // while a thread is open, the other conversations fade back
                    className={`flex items-start justify-between gap-6 transition-opacity hover:opacity-100 ${
                      activeId !== null && !isActive && !isUnread
                        ? "opacity-60"
                        : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`truncate ${
                            isUnread ? "font-semibold" : ""
                          }`}
                        >
                          {conversation.other_user_name}
                        </p>
                        {isUnread && (
                          <span
                            aria-label={`${conversation.unread_count} unread`}
                            className="flex h-5 min-w-5 shrink-0 items-center justify-center bg-black px-1.5 text-xs text-white"
                          >
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-1 text-xs ${
                          isUnread ? "font-semibold" : ""
                        }`}
                      >
                        {conversation.last_message_at
                          ? formatMessageDate(conversation.last_message_at)
                          : "No messages yet"}
                      </p>
                      <p className="mt-5 truncate text-xs underline underline-offset-2">
                        {conversation.item_name}
                      </p>
                      {itemDetails && (
                        <p className="mt-1 truncate text-xs">{itemDetails}</p>
                      )}
                    </div>
                    <img
                      src={conversation.image_url}
                      alt=""
                      className="aspect-11/15 w-20 shrink-0 bg-[#ececec] object-cover"
                    />
                  </Link>
                </li>
              );
            })
          )}
        </ul>

        <div
          className={`min-w-0 flex-1 md:block ${
            activeId === null ? "hidden" : ""
          }`}
        >
          {activeId !== null ? (
            <ConversationThread key={activeId} conversationId={activeId} />
          ) : (
            <p className="flex h-full items-center justify-center p-4 text-sm text-gray-500">
              Select a conversation to view messages.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
