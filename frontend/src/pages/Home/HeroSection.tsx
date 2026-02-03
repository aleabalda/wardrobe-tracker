export const HeroSection = () => {
  return (
    <section
      className="
        relative w-full h-[700px] text-white
        bg-[linear-gradient(to_bottom,rgba(0,0,0,0.50),rgba(0,0,0,0.50)),url('/src/assets/images/hero-wardrobe.jpg')]
        bg-cover bg-center bg-no-repeat
      "
    >
      <div className="pl-10 flex flex-col gap-6 justify-center h-full">
        <p className="font-bold text-7xl">Declutter. Discover. Do Good.</p>
        <p className="text-xl">
          Build your digital wardrobe, showcase your style, and turn your closet
          into a marketplace.
        </p>
        <button className="p-4 text-black bg-amber-500 w-fit rounded-lg font-bold text-lg hover:bg-amber-600 hover:cursor-pointer transition-all ease-in-out duration-150">
          Create your wardrobe now
        </button>
      </div>
    </section>
  );
};
