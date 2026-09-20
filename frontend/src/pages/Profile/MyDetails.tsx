import { useEffect, useState } from "react";
import type { UserDetails } from "../../types/UserDetails";
import avatar from "../../assets/images/avatar.webp";
import { fetchUserDetails } from "../../api/user";
// FETCH USER DETAILS TO DISPLAY HERE, NEED BACKEND ENDPOINT

export const MyDetails = () => {
  const [user, setUser] = useState<UserDetails | null>(null);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const data = await fetchUserDetails();
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    getUserDetails();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex gap-8">
      <img
        src={avatar}
        alt="avatar"
        className="size-50 rounded-full border-2 border-black"
      />
      <div className="flex flex-col gap-1">
        <p>Username: {user.username}</p>
        <p>
          Name: {user.first_name} {user.last_name}
        </p>
        <p>Email: {user.email}</p>
        <p>Phone: {user.phone_number}</p>
      </div>
    </div>
  );
};
