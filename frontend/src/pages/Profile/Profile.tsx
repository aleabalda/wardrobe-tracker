import { useEffect, useState } from "react";
import { fetchUserDetails } from "../../api/user";
import type { UserDetails } from "../../types/UserDetails";
import { AccountDetails } from "./AccountDetails";
import { ProfileSummary } from "./ProfileSummary";

export const Profile = () => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserDetails().then(setUser, (error: unknown) => {
      console.error("Unable to load profile:", error);
      setError("Unable to load your profile.");
    });
  }, []);

  return (
    <div className="p-12 pt-6">
      <h2 className="mb-8 text-5xl">Profile</h2>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !user ? (
        <p className="text-sm text-gray-500">Loading profile...</p>
      ) : (
        <div className="grid gap-12 md:grid-cols-[18rem_1fr] lg:gap-20">
          <ProfileSummary user={user} onUserChange={setUser} />
          <AccountDetails user={user} onUserChange={setUser} />
        </div>
      )}
    </div>
  );
};
