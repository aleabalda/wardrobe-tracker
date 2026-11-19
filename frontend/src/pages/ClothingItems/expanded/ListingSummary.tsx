import { Link } from "react-router-dom";
import {
  LISTING_STATUSES,
  type ListingStatus,
} from "../../../utils/listingStatus";

/**
 * A listed item's status, read-only; it's changed by editing the listing,
 * so this links there
 */
export const ListingSummary = ({
  listingId,
  status,
}: {
  listingId: number;
  status: ListingStatus;
}) => (
  <section className="mt-6">
    <h2 className="font-medium">Listing</h2>
    <div className="mt-2 flex items-center justify-between gap-3 text-sm">
      <p>
        Status:{" "}
        <span className="text-gray-700">
          {LISTING_STATUSES.find(({ value }) => value === status)?.label ??
            status}
        </span>
      </p>
      <Link to={`/listings/${listingId}`} className="shrink-0 underline">
        View or edit listing
      </Link>
    </div>
  </section>
);
