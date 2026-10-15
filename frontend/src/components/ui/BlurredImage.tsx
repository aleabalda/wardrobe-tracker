type BlurredImageProps = {
  src: string;
  alt: string;
  className?: string;
};

// Shows the image at its original aspect ratio, filling the leftover space
// with a blurred copy of itself (like Facebook Marketplace).
export const BlurredImage = ({ src, alt, className = "" }: BlurredImageProps) => {
  return (
    <div className={`relative overflow-hidden bg-neutral-200 ${className}`}>
      {/* scale-110 hides the soft, faded edges that blur creates */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
      />
      <img
        src={src}
        alt={alt}
        className="relative block h-full w-full object-contain"
      />
    </div>
  );
};
