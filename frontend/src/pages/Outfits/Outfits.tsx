import { useNavigate } from "react-router-dom";

export const Outfits = () => {
  const navigate = useNavigate();
  return (
    <div className="p-12 pt-6">
      <h1 className="text-lg">Outfits</h1>
      <button
        type="button"
        className="cursor-pointer underline text-sm"
        onClick={() => {
          navigate("/outfits/create-outfit");
        }}
      >
        Create Outfit
      </button>
    </div>
  );
};
