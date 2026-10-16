import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-6xl">404</h1>
      <p className="text-gray-600">
        Sorry, the page you're looking for doesn't exist.
      </p>
      <Link to="/" className="cursor-pointer text-sm underline">
        Back to Home
      </Link>
    </div>
  );
};
