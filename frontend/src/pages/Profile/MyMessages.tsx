import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchConversations } from "../../api/conversations";
import { useSocket } from "../../context/SocketContext";
import type { Conversation } from "../../types/Conversation";
import { formatMessageTime } from "../../utils/formatMessageTime";
import { ConversationThread } from "./ConversationThread";

export const MyMessages = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1">
        <div>
          <h2 className="text-xl font-semibold mb-2 px-8">Messages</h2>

          <ul className="w-80 shrink-0 overflow-y-auto">
            {isLoading ? (
              <li className="p-4 text-sm text-gray-500">Loading messages...</li>
            ) : error && conversations.length === 0 ? (
              <li className="p-4 text-sm text-red-600">{error}</li>
            ) : conversations.length === 0 ? (
              <li className="p-4 text-sm text-gray-500">
                No conversations yet. Message a seller from a listing to start
                one.
              </li>
            ) : (
              conversations.map((conversation) => {
                // the open conversation is being read, so it's never shown as
                // unread even before the server confirms it
                const isUnread =
                  conversation.unread_count > 0 && conversation.id !== activeId;

                return (
                  <li key={conversation.id}>
                    <Link
                      to={`/profile/messages/${conversation.id}`}
                      aria-current={
                        conversation.id === activeId ? "page" : undefined
                      }
                      className={`flex items-center gap-3 border-b border-t border-gray-200 p-3 hover:bg-gray-100 ${
                        conversation.id === activeId ? "bg-gray-100" : ""
                      }`}
                    >
                      <img
                        src={conversation.image_url}
                        alt=""
                        className="h-14 w-10 shrink-0 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-semibold">
                            {conversation.other_user_name}
                          </p>
                          <div className="flex shrink-0 items-center gap-2">
                            {conversation.last_message_at && (
                              <p
                                className={`text-xs ${
                                  isUnread
                                    ? "font-semibold text-black"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatMessageTime(
                                  conversation.last_message_at,
                                )}
                              </p>
                            )}
                            {isUnread && (
                              <span
                                aria-label={`${conversation.unread_count} unread`}
                                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-xs text-white"
                              >
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="truncate text-xs text-gray-600">
                          {conversation.item_name}
                        </p>
                        <p
                          className={`truncate text-xs ${
                            isUnread
                              ? "font-semibold text-black"
                              : "text-gray-500"
                          }`}
                        >
                          {conversation.last_message ?? "No messages yet"}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <div className="min-w-0 flex-1 border-l border-black">
          {activeId !== null ? (
            <ConversationThread key={activeId} conversationId={activeId} />
          ) : (
            <p className="p-4 text-sm text-gray-500">
              Select a conversation to view messages.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
