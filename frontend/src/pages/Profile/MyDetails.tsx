import { useEffect } from "react";
import avatar from "../../assets/images/avatar.webp";
// FETCH USER DETAILS TO DISPLAY HERE, NEED BACKEND ENDPOINT

export const MyDetails = () => {
  useEffect(() => {}, []);
  return (
    <div className="flex gap-8">
      <img
        src={avatar}
        alt="avatar"
        className="size-50 rounded-full border-2 border-black"
      />
      <div className="flex flex-col gap-1">
        <p>Username:</p>
        <p>Name:</p>
        <p>Email:</p>
      </div>
    </div>
  );
};
