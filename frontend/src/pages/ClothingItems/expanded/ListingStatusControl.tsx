import { useState } from "react";
import { Link } from "react-router-dom";
import { updateListingStatus } from "../../../api/listings";
import { SelectField } from "../../../components/ui/FormField";
import {
  LISTING_STATUSES,
  type ListingStatus,
} from "../../../utils/listingStatus";

/** Changes a listed item's status, with a link to its listing */
export const ListingStatusControl = ({
  listingId,
  status,
  onStatusChange,
  onError,
}: {
  listingId: number;
  status: ListingStatus;
  /** Called once the new status has been saved */
  onStatusChange: (status: ListingStatus) => void;
  onError: (message: string | null) => void;
}) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleChange = async (newStatus: ListingStatus) => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      onError(null);

      await updateListingStatus(listingId, newStatus);
      onStatusChange(newStatus);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Unable to update listing status.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-3 flex items-center gap-3">
      <SelectField
        label="Listing status"
        className="flex-1"
        value={status}
        disabled={isSaving}
        onChange={(event) => {
          void handleChange(event.target.value as ListingStatus);
        }}
      >
        {LISTING_STATUSES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>
      <Link
        to={`/listings/${listingId}`}
        className="shrink-0 text-sm underline"
      >
        View listing
      </Link>
    </div>
  );
};
