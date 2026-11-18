import type { ReactNode } from "react";

/** Name, price and status badge at the top of a detail page's panel */
export const ItemHeader = ({
  name,
  price,
  badge,
  children,
}: {
  name: string;
  price: number | null;
  badge?: string;
  /** Extra lines under the price, e.g. when it was listed */
  children?: ReactNode;
}) => (
  <>
    <h1 className="text-2xl font-semibold leading-tight">{name}</h1>
    {(price !== null || badge) && (
      <div className="mt-1 flex items-center gap-2">
        {price !== null && <p className="text-lg">${price}</p>}
        {badge && (
          <span className="border border-black px-1.5 py-0.5 text-xs">
            {badge}
          </span>
        )}
      </div>
    )}
    {children}
  </>
);

/** The Details list and description of a clothing item or listing */
export const ItemDetails = ({
  item,
}: {
  item: {
    brand: string;
    type: string;
    size: string;
    color: string;
    description?: string | null;
  };
}) => {
  const details = [
    { label: "Brand", value: item.brand },
    { label: "Type", value: item.type },
    { label: "Size", value: item.size },
    { label: "Color", value: item.color },
  ].filter(({ value }) => value);

  return (
    <>
      <h2 className="mt-6 font-medium">Details</h2>
      <dl className="mt-2 grid grid-cols-[6rem_1fr] gap-y-2 text-sm">
        {details.map(({ label, value }) => (
          <div key={label} className="contents">
            <dt>{label}</dt>
            <dd className="text-gray-700">{value}</dd>
          </div>
        ))}
      </dl>

      {item.description && (
        <p className="mt-5 whitespace-pre-line text-sm leading-relaxed">
          {item.description}
        </p>
      )}
    </>
  );
};
