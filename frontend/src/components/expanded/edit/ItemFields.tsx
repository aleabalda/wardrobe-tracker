import { ITEM_CLOTHING_TYPES } from "../../../types/clothingItemTypes";
import {
  LISTING_STATUSES,
  type ListingStatus,
} from "../../../utils/listingStatus";
import { SelectField, TextField } from "../../ui/FormField";
import type { ItemFieldValues } from "./itemFieldValues";

/** Name, brand, type, size and colour, laid out for a PanelForm's grid */
export const ItemFields = ({
  values,
  onChange,
  autoFocus = true,
}: {
  values: ItemFieldValues;
  onChange: (values: ItemFieldValues) => void;
  /** Focuses Name when the form opens; off when other fields come first */
  autoFocus?: boolean;
}) => {
  const set = (field: keyof ItemFieldValues) => (value: string) => {
    onChange({ ...values, [field]: value });
  };

  // keeps a type from before the current list selectable instead of blank
  const typeOptions: readonly string[] = ITEM_CLOTHING_TYPES.some(
    (val) => val === values.type,
  )
    ? ITEM_CLOTHING_TYPES
    : [values.type, ...ITEM_CLOTHING_TYPES];

  return (
    <>
      <TextField
        label="Name"
        className="col-span-2"
        autoFocus={autoFocus}
        required
        maxLength={100}
        value={values.name}
        onChange={(e) => {
          set("name")(e.target.value);
        }}
      />
      <TextField
        label="Brand"
        optional
        className="col-span-2"
        maxLength={100}
        value={values.brand}
        onChange={(e) => {
          set("brand")(e.target.value);
        }}
      />
      <SelectField
        label="Type"
        required
        value={values.type}
        onChange={(e) => {
          set("type")(e.target.value);
        }}
      >
        {typeOptions.map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </SelectField>
      <TextField
        label="Size"
        optional
        maxLength={20}
        value={values.size}
        onChange={(e) => {
          set("size")(e.target.value);
        }}
      />
      <TextField
        label="Color"
        optional
        className="col-span-2"
        maxLength={50}
        value={values.color}
        onChange={(e) => {
          set("color")(e.target.value);
        }}
      />
    </>
  );
};

export const ListingStatusSelect = ({
  value,
  onChange,
  className = "col-span-2",
}: {
  value: ListingStatus;
  onChange: (status: ListingStatus) => void;
  /** Full width by default; "" leaves it one column wide */
  className?: string;
}) => (
  <SelectField
    label="Listing status"
    className={className}
    value={value}
    onChange={(e) => {
      onChange(e.target.value as ListingStatus);
    }}
  >
    {LISTING_STATUSES.map(({ value, label }) => (
      <option key={value} value={value}>
        {label}
      </option>
    ))}
  </SelectField>
);
