import { useEffect, useRef, useState } from "react";
import type { UserDetails } from "../../types/UserDetails";
import avatar from "../../assets/images/avatar.webp";
import { fetchUserDetails, uploadAvatar } from "../../api/user";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
// FETCH USER DETAILS TO DISPLAY HERE, NEED BACKEND ENDPOINT

export const MyDetails = () => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // reset so picking the same file again still triggers onChange
    e.target.value = "";
    if (!file) return;

    setIsUploadingAvatar(true);

    try {
      const avatarUrl = await uploadAvatar(file);
      setUser((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : prev));
    } catch (err) {
      console.error(err);
      alert("Error uploading profile picture");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }
  return (
    <div className="w-72 h-full pr-8 border-r-2 border-r-black flex flex-col items-center">
      <h2 className="text-4xl font-semibold mb-2">Details</h2>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          disabled={isUploadingAvatar}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full cursor-pointer disabled:cursor-wait"
          title="Change profile picture"
        >
          <img
            src={user.avatar_url ?? avatar}
            alt="avatar"
            className={`size-50 rounded-full border-2 border-black object-cover ${
              isUploadingAvatar ? "opacity-50" : "hover:opacity-80"
            }`}
          />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <p className="text-xl font-semibold">{user.username.toUpperCase()}</p>
        <div className="flex gap-1 items-center">
          <span>
            <PersonIcon fontSize="small" />
          </span>
          <p>
            {user.first_name} {user.last_name}
          </p>
        </div>
        <div className="flex gap-1 items-center">
          <span>
            <EmailIcon fontSize="small" />
          </span>
          <p>{user.email}</p>
        </div>
        {user.phone_number.length > 0 && (
          <div className="flex gap-1 items-center">
            <span>
              <PhoneIcon fontSize="small" />
            </span>
            <p>{user.phone_number}</p>
          </div>
        )}
        <button className="rounded mt-4 py-2 px-4 outline-1 outline-black font-semibold cursor-pointer">
          Edit
        </button>
      </div>
    </div>
  );
};
