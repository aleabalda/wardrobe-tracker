import defaultAvatar from "../../assets/images/avatar.webp";
import { APP_NAME, LogoMark } from "../Logo";

/** Avatar, name and join year at the bottom of a detail page's panel */
export const OwnerInfo = ({
  title,
  name,
  avatarUrl,
  joinedAt,
  isYou,
}: {
  /** e.g. "Seller information" */
  title: string;
  name: string;
  avatarUrl: string | null;
  joinedAt: string;
  /** Marks the name with "(You)" */
  isYou: boolean;
}) => {
  // left out rather than shown as "NaN" if the date is missing
  const joinedYear = new Date(joinedAt).getFullYear();

  return (
    <section className="mt-auto pt-6">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-3 flex items-center gap-3">
        <img
          src={avatarUrl ?? defaultAvatar}
          alt="user profile"
          className="size-10 shrink-0 rounded-full border border-gray-200 object-cover"
        />
        <div className="min-w-0">
          <p className="truncate font-medium text-sm">
            {name}
            {isYou && <span className="text-gray-500 text-xs"> (You)</span>}
          </p>
          {!Number.isNaN(joinedYear) && (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
              <LogoMark className="h-3 w-auto text-black" />
              Joined {APP_NAME} in {joinedYear}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
