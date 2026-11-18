export type UserDetails = {
  id: number;
  email: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  item_count: number;
  outfit_count: number;
  active_listing_count: number;
};

/** The fields a user can change on their profile */
export type EditableProfile = Pick<
  UserDetails,
  "username" | "first_name" | "last_name" | "phone_number" | "bio"
>;
