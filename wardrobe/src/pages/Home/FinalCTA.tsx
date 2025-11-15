export const FinalCTA = () => {
  return (
    <section className="p-14 gap-10 h-[700px]">
      <div
        className="bg-[linear-gradient(to_bottom,rgba(0,0,0,0.50),rgba(0,0,0,0.50)),url('/src/assets/images/hangingClothes.jpg')]
        bg-cover bg-top bg-no-repeat h-full w-full rounded flex flex-col items-center justify-center shadow-2xl"
      >
        <p className="text-white text-6xl font-bold mb-6">
          Ready to Take Control of Your Wardrobe?
        </p>
        <button className="w-fit p-4 text-xl bg-amber-500 rounded-lg shadow-md font-bold hover:bg-amber-600 hover:cursor-pointer transition-all ease-in-out duration-150 mt-2">
          Get Started Now
        </button>
      </div>
    </section>
  );
};
