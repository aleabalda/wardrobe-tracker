export const APP_NAME = "Rehang";

/**
 * A clothes hanger whose hook curls back on itself into an arrow: hang it
 * up, wear it again, pass it on. The hook is always amber; the body follows
 * the current text colour so the mark works on light and dark backgrounds.
 */
export const LogoMark = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 48 40"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    {/* hook: a 270° loop ending in an arrowhead */}
    <g className="stroke-amber-500" strokeWidth="3">
      <path d="M24 17V14A5 5 0 1 0 19 9" />
      <path d="M16 7.5 19 10.5 22 7.5" />
    </g>
    {/* hanger body */}
    <path
      d="M24 17 5.5 32.5Q3.5 35 7 35.5H41Q44.5 35 42.5 32.5Z"
      stroke="currentColor"
      strokeWidth="3"
    />
  </svg>
);

/**
 * Mark + wordmark. Sized by font-size, so set a text-* class to scale it.
 */
export const Logo = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-flex items-center gap-[0.25em] font-title leading-none font-semibold tracking-tight ${className}`}
  >
    <LogoMark className="h-[0.95em] w-auto shrink-0" />
    <span>
      <span className="font-normal text-amber-500 italic">re</span>hang
    </span>
  </span>
);
