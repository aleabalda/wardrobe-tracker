const capitalise = (text: string) => `${text[0].toUpperCase()}${text.slice(1)}`;

/**
 * Reads text fields from a request body: trims them, checks their length and
 * that required ones aren't blank, and turns blank optional ones into null.
 * Gives the first problem as a message instead when something's wrong.
 */
export const readTextFields = <Field extends string>(
  body: Record<string, unknown>,
  limits: Record<Field, number>,
  required: readonly NoInfer<Field>[] = [],
):
  | { values: Record<Field, string | null>; error?: undefined }
  | { error: string; values?: undefined } => {
  const values = {} as Record<Field, string | null>;

  for (const field of Object.keys(limits) as Field[]) {
    const raw = body[field];

    if (raw !== undefined && raw !== null && typeof raw !== "string") {
      return { error: `${capitalise(field)} must be text.` };
    }

    const value = typeof raw === "string" ? raw.trim() : "";

    if (value.length > limits[field]) {
      return {
        error: `${capitalise(field)} must be at most ${limits[field]} characters.`,
      };
    }

    if (!value && required.includes(field)) {
      return { error: `${capitalise(field)} is required.` };
    }

    values[field] = value === "" ? null : value;
  }

  return { values };
};

// longest each clothing item text field may be, matching the table
export const ITEM_FIELD_LIMITS = {
  name: 100,
  brand: 100,
  type: 50,
  color: 50,
  size: 20,
} as const;

export const REQUIRED_ITEM_FIELDS = ["name", "type"] as const;

// TEXT columns hold up to this many bytes
export const DESCRIPTION_LIMIT = 65535;

export const LISTING_STATUSES = ["active", "cancelled", "sold", "pending"];
