import {
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const boxClass =
  "relative block border border-black bg-white focus-within:ring-1 focus-within:ring-black";
const labelClass =
  "pointer-events-none absolute left-3 text-sm text-gray-500 transition-all duration-150";
const controlClass =
  "w-full bg-transparent px-3 pt-6 text-sm outline-none placeholder:text-transparent focus:placeholder:text-gray-400";
const noteClass =
  "pointer-events-none absolute right-3 text-sm peer-[:not(:placeholder-shown)]:hidden";

// The label sits in the middle of an empty field and moves to the top once the
// field is focused, filled in, or autofilled by the browser
const FLOATING_LABEL =
  "top-1.5 peer-[:placeholder-shown:not(:focus):not(:autofill)]:top-1/2 peer-[:placeholder-shown:not(:focus):not(:autofill)]:-translate-y-1/2";

type FieldProps = {
  label: string;
  /** Shows "Optional" until the field is filled in */
  optional?: boolean;
  /** Example text shown once the field is focused */
  hint?: string;
};

export const TextField = ({
  label,
  optional = false,
  hint,
  adornment,
  className = "",
  ...inputProps
}: FieldProps & {
  /** Always shown on the right of the field, e.g. a currency */
  adornment?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) => {
  const id = useId();

  return (
    <div className={`${boxClass} ${className}`}>
      <input
        {...inputProps}
        id={id}
        placeholder={hint ?? " "}
        className={`peer h-13 pb-1 ${controlClass} ${
          optional || adornment ? "pr-20" : ""
        } [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
      />
      <label htmlFor={id} className={`${labelClass} ${FLOATING_LABEL}`}>
        {label}
      </label>
      {optional && (
        <span className={`${noteClass} top-1/2 -translate-y-1/2`}>
          Optional
        </span>
      )}
      {adornment && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm">
          {adornment}
        </span>
      )}
    </div>
  );
};

export const TextAreaField = ({
  label,
  optional = false,
  hint,
  className = "",
  ...textareaProps
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const id = useId();

  return (
    <div className={`${boxClass} ${className}`}>
      <textarea
        {...textareaProps}
        id={id}
        placeholder={hint ?? " "}
        className={`peer block resize-none pb-2 ${controlClass}`}
      />
      <label
        htmlFor={id}
        className={`${labelClass} top-1.5 peer-[:placeholder-shown:not(:focus)]:top-3.5`}
      >
        {label}
      </label>
      {optional && <span className={`${noteClass} top-3.5`}>Optional</span>}
    </div>
  );
};

export const SelectField = ({
  label,
  value,
  className = "",
  children,
  ...selectProps
}: { label: string } & SelectHTMLAttributes<HTMLSelectElement>) => {
  const id = useId();

  return (
    <div className={`${boxClass} ${className}`}>
      <select
        {...selectProps}
        id={id}
        value={value}
        className={`h-13 cursor-pointer appearance-none pb-1 pr-10 ${controlClass}`}
      >
        {/* blank choice so the field starts empty, with its label centred */}
        <option value="" disabled hidden></option>
        {children}
      </select>
      <label
        htmlFor={id}
        className={`${labelClass} ${
          value === "" ? "top-1/2 -translate-y-1/2" : "top-1.5"
        }`}
      >
        {label}
      </label>
      <KeyboardArrowDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
    </div>
  );
};

export const FileField = ({
  label,
  fileName,
  className = "",
  ...inputProps
}: {
  label: string;
  fileName?: string;
} & InputHTMLAttributes<HTMLInputElement>) => {
  const id = useId();

  return (
    <div className={`${boxClass} h-13.5 ${className}`}>
      <input
        {...inputProps}
        id={id}
        type="file"
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <label
        htmlFor={id}
        className={`${labelClass} ${
          fileName ? "top-1.5" : "top-1/2 -translate-y-1/2"
        }`}
      >
        {label}
      </label>
      {fileName && (
        <p className="pointer-events-none absolute inset-x-3 top-6 truncate pr-24 text-sm">
          {fileName}
        </p>
      )}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm underline">
        {fileName ? "Change file" : "Choose file"}
      </span>
    </div>
  );
};

/** Full-width form button: solid black, or greyed out while disabled. */
export const SubmitButton = ({
  className = "",
  children,
  ...buttonProps
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="submit"
    {...buttonProps}
    className={`h-13.5 w-full cursor-pointer border border-black bg-black text-sm text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-gray-500 disabled:bg-gray-100 disabled:text-gray-500 ${className}`}
  >
    {children}
  </button>
);
