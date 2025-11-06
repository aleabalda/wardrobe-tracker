export const Header = () => {
  return (
    <header className="flex items-center justify-between p-6">
      <h1 className="font-[Playfair-Display] font-bold text-4xl">Wardrobe</h1>
      <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 hover:cursor-pointer transition-all ease-in-out font-bold hover:shadow-md hover:shadow-gray-200">
        Login
      </button>
    </header>
  );
};
