import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { APP_NAME, LogoMark } from "../Logo";
import { BlurredImage } from "../ui/BlurredImage";

const overlayButtonClass =
  "flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black";

/**
 * Full-screen detail page: the photo on the left (on top on small screens)
 * and a scrolling side panel, with an optional bar pinned to its bottom.
 */
export const ExpandedLayout = ({
  imageUrl,
  imageAlt,
  closeLabel,
  fallbackPath,
  overlays,
  footer,
  children,
}: {
  imageUrl: string;
  imageAlt: string;
  /** e.g. "Close listing" */
  closeLabel: string;
  /** Where closing goes when there's no page to go back to */
  fallbackPath: string;
  /** Toasts and dialogs that float over the page */
  overlays?: ReactNode;
  /** Pinned below the scrolling panel content */
  footer?: ReactNode;
  children: ReactNode;
}) => {
  const navigate = useNavigate();

  const close = () => {
    if ((window.history.state as { idx?: number } | null)?.idx) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden md:flex-row">
      {overlays}

      <div className="relative h-[55dvh] min-w-0 shrink-0 bg-neutral-900 md:h-full md:flex-1">
        <BlurredImage src={imageUrl} alt={imageAlt} className="h-full w-full" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <button
            type="button"
            onClick={close}
            aria-label={closeLabel}
            className={overlayButtonClass}
          >
            <CloseIcon />
          </button>
          <Link
            to="/"
            aria-label={`${APP_NAME} home`}
            className={overlayButtonClass}
          >
            <LogoMark className="h-5 w-auto" />
          </Link>
        </div>
      </div>

      <aside className="flex min-h-0 w-full flex-1 flex-col md:w-96 md:flex-none md:shrink-0 lg:w-md">
        <div className="flex flex-1 flex-col overflow-y-auto p-5">
          {children}
        </div>
        {footer}
      </aside>
    </div>
  );
};
