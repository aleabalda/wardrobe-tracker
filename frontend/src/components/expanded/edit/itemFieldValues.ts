/** What the shared item fields edit, as the text in each input */
export type ItemFieldValues = {
  name: string;
  brand: string;
  type: string;
  size: string;
  color: string;
};

/** The starting values for the item fields, with blanks for missing ones */
export const toItemFieldValues = (item: {
  name: string;
  brand: string | null;
  type: string;
  size: string | null;
  color: string | null;
}): ItemFieldValues => ({
  name: item.name,
  brand: item.brand ?? "",
  type: item.type,
  size: item.size ?? "",
  color: item.color ?? "",
});

/** Name and type are the only required item fields */
export const hasRequiredItemFields = ({ name, type }: ItemFieldValues) =>
  name.trim() !== "" && type !== "";
