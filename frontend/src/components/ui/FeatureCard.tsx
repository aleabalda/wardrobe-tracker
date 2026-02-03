export const FeatureCard = ({
  image,
  headline,
  text,
}: {
  image: string;
  headline: string;
  text: string;
}) => {
  return (
    <div className="w-96 h-fit max-h-96 shadow-2xl rounded overflow-hidden group">
      <img
        src={image}
        alt="feature"
        className="transition-all duration-500 w-full h-80 object-cover group-hover:brightness-75"
      />
      <div className="transition-all duration-500 group-hover:-translate-y-48 bg-white text-center">
        <p className="text-lg font-semibold text-center py-4">{headline}</p>
        <p className="p-4 pt-0">{text}</p>
      </div>
    </div>
  );
};
