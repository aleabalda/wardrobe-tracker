import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchConversation,
  markConversationRead,
  sendMessage,
} from "../../api/conversations";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import type { ConversationDetail, Message } from "../../types/Conversation";
import { formatMessageTime } from "../../utils/formatMessageTime";

// your own messages arrive twice (POST response and socket), so skip repeats
const appendMessage = (
  conversation: ConversationDetail | null,
  message: Message,
) =>
  conversation && !conversation.messages.some(({ id }) => id === message.id)
    ? { ...conversation, messages: [...conversation.messages, message] }
    : conversation;

export const ConversationThread = ({
  conversationId,
}: {
  conversationId: number;
}) => {
  const { auth } = useAuth();
  const socket = useSocket();
  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const markRead = useCallback(async () => {
    try {
      await markConversationRead(conversationId);
    } catch (error) {
      console.error("Unable to mark conversation as read:", error);
    }
  }, [conversationId]);

  const loadConversation = useCallback(async () => {
    try {
      const result = await fetchConversation(conversationId);
      setConversation(result);
      setError(null);
      // opening the conversation means its messages have now been seen
      if (result.unread_count > 0) void markRead();
    } catch (error) {
      console.error("Unable to load conversation:", error);
      setError("Unable to load this conversation.");
    }
  }, [conversationId, markRead]);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (message: Message) => {
      if (message.conversation_id !== conversationId) return;
      setConversation((current) => appendMessage(current, message));
      // it's being read as it arrives since this conversation is open
      if (message.sender_id !== auth.userId) void markRead();
    };
    // catch up on anything sent while the connection was down
    const onReconnect = () => {
      void loadConversation();
    };

    socket.on("message:new", onNewMessage);
    socket.io.on("reconnect", onReconnect);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.io.off("reconnect", onReconnect);
    };
  }, [socket, conversationId, auth.userId, loadConversation, markRead]);

  // keep the newest message in view
  const messageCount = conversation?.messages.length ?? 0;
  useEffect(() => {
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messageCount]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || isSending || !conversation) return;

    setIsSending(true);
    setSendError(null);
    try {
      const message = await sendMessage(conversationId, body);
      setConversation((current) => appendMessage(current, message));
      setDraft("");
    } catch (error) {
      console.error("Unable to send message:", error);
      setSendError("Unable to send message.");
    } finally {
      setIsSending(false);
    }
  };

  if (error && !conversation) {
    return <p className="p-4 text-sm text-red-600">{error}</p>;
  }

  if (!conversation) {
    return <p className="p-4 text-sm text-gray-500">Loading conversation...</p>;
  }

  // sellers manage their own item; buyers see the read-only listing
  const itemPath =
    conversation.seller_id === auth.userId
      ? `/wardrobe/${conversation.clothing_item_id}`
      : `/listings/${conversation.listing_id}`;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-black p-4">
        <img
          src={conversation.image_url}
          alt={conversation.item_name}
          className="h-16 w-12 object-cover"
        />
        <div className="min-w-0 flex-1">
          <Link
            to={itemPath}
            className="block truncate font-semibold hover:underline"
          >
            {conversation.item_name}
          </Link>
          <p className="truncate text-xs text-gray-600">
            {conversation.seller_id === auth.userId ? "Buyer" : "Seller"}:{" "}
            {conversation.other_user_name}
            {conversation.price !== null && ` | $${conversation.price}`}
          </p>
        </div>
      </div>

      <div
        ref={messagesRef}
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-4"
      >
        {conversation.messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            No messages yet. Say hi to {conversation.other_user_name}!
          </p>
        ) : (
          conversation.messages.map((message, index) => {
            const isOwn = message.sender_id === auth.userId;
            const time = formatMessageTime(message.created_at);
            // consecutive messages from the same person in the same minute
            // share one timestamp, shown under the last of them
            const next = conversation.messages[index + 1];
            const showTime =
              !next ||
              next.sender_id !== message.sender_id ||
              formatMessageTime(next.created_at) !== time;

            return (
              <div
                key={message.id}
                className={`flex max-w-[75%] flex-col ${
                  isOwn ? "self-end items-end" : "self-start items-start"
                } ${showTime ? "mb-2" : ""}`}
              >
                <p
                  className={`whitespace-pre-wrap wrap-break-word rounded border border-black px-3 py-2 text-sm ${
                    isOwn ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {message.body}
                </p>
                {showTime && (
                  <p className="mt-1 text-xs text-gray-500">{time}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
        className="px-4 py-2"
      >
        {sendError && <p className="mb-2 text-xs text-red-600">{sendError}</p>}
        <div className="flex items-end gap-3">
          <textarea
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            onKeyDown={(event) => {
              // Enter sends, Shift+Enter adds a new line
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            rows={2}
            maxLength={2000}
            placeholder="Write a message..."
            aria-label="Message"
            className="flex-1 resize-none rounded p-3 text-sm outline-1 outline-gray-400 focus:outline-black"
          />
          <button
            type="submit"
            disabled={!draft.trim() || isSending}
            className="cursor-pointer border border-black px-4 py-2 text-sm hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-black"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};
