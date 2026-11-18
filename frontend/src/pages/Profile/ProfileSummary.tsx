import { useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import defaultAvatar from "../../assets/images/avatar.webp";
import { uploadAvatar } from "../../api/user";
import { APP_NAME, LogoMark } from "../../components/Logo";
import type { UserDetails } from "../../types/UserDetails";
import { formatJoinedDate } from "../../utils/formatJoinedDate";

/** Photo, name, bio and a few counts down the left of the profile page */
export const ProfileSummary = ({
  user,
  onUserChange,
}: {
  user: UserDetails;
  onUserChange: (user: UserDetails) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // reset so picking the same file again still triggers onChange
    e.target.value = "";
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      const avatarUrl = await uploadAvatar(file);
      onUserChange({ ...user, avatar_url: avatarUrl });
    } catch (error) {
      console.error("Unable to upload profile picture:", error);
      setError("Unable to upload your profile picture.");
    } finally {
      setIsUploading(false);
    }
  };

  const joined = formatJoinedDate(user.created_at);
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  const stats = [
    { count: user.item_count, noun: "Item", to: "/wardrobe" },
    { count: user.outfit_count, noun: "Outfit", to: "/outfits" },
    { count: user.active_listing_count, noun: "Listing", to: "/listings" },
  ];

  return (
    <section>
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Change profile picture"
        className="group relative block cursor-pointer rounded-full disabled:cursor-wait"
      >
        <img
          src={user.avatar_url ?? defaultAvatar}
          alt=""
          className={`size-40 rounded-full border border-gray-200 object-cover transition-opacity ${
            isUploading ? "opacity-50" : "group-hover:opacity-80"
          }`}
        />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleAvatarChange(e);
        }}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="mt-3 cursor-pointer text-xs underline disabled:cursor-wait"
      >
        {isUploading ? "Uploading..." : "Change photo"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <h3 className="mt-6 text-2xl font-semibold leading-tight">
        {fullName || user.username}
      </h3>
      {fullName && <p className="text-sm text-gray-500">@{user.username}</p>}

      {user.bio ? (
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">
          {user.bio}
        </p>
      ) : (
        <p className="mt-4 text-sm text-gray-500">No bio yet.</p>
      )}

      {joined && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-500">
          <LogoMark className="h-3 w-auto text-black" />
          Joined {APP_NAME} in {joined}
        </p>
      )}

      <ul className="mt-8 grid grid-cols-3 border-y border-black py-4 text-center">
        {stats.map(({ count, noun, to }) => (
          <li key={noun}>
            <Link to={to} className="group block">
              <span className="block text-2xl">{count}</span>
              <span className="text-xs group-hover:underline">
                {count === 1 ? noun : `${noun}s`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
