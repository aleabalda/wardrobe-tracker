export type Message = {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  created_at: string;
};

// other_user_* is whoever the logged in user is talking to
export type Conversation = {
  id: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  updated_at: string;
  clothing_item_id: number;
  price: number | null;
  item_name: string;
  image_url: string;
  other_user_id: number;
  other_user_name: string;
  last_message: string | null;
  last_message_at: string | null;
  // messages from the other person this user hasn't opened yet
  unread_count: number;
};

export type ConversationDetail = Conversation & {
  messages: Message[];
};
