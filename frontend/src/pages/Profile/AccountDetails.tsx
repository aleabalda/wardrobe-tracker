import { useState, type FormEvent } from "react";
import { updateProfile } from "../../api/user";
import {
  SubmitButton,
  TextAreaField,
  TextField,
} from "../../components/ui/FormField";
import type { EditableProfile, UserDetails } from "../../types/UserDetails";

const BIO_LIMIT = 500;

const toForm = (user: UserDetails): Record<keyof EditableProfile, string> => ({
  username: user.username,
  first_name: user.first_name ?? "",
  last_name: user.last_name ?? "",
  phone_number: user.phone_number ?? "",
  bio: user.bio ?? "",
});

/** The account's details, shown as a list until the user chooses to edit */
export const AccountDetails = ({
  user,
  onUserChange,
}: {
  user: UserDetails;
  onUserChange: (user: UserDetails) => void;
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <section className="max-w-xl">
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-black pb-2">
        <h3 className="font-medium">Account details</h3>
        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
            }}
            className="cursor-pointer text-sm underline"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <EditForm
          user={user}
          onSaved={(updated) => {
            onUserChange(updated);
            setIsEditing(false);
          }}
          onCancel={() => {
            setIsEditing(false);
          }}
        />
      ) : (
        <DetailsList user={user} />
      )}
    </section>
  );
};

const DetailsList = ({ user }: { user: UserDetails }) => {
  const rows = [
    { label: "Username", value: user.username },
    { label: "First name", value: user.first_name },
    { label: "Last name", value: user.last_name },
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phone_number },
  ];

  return (
    <dl className="grid grid-cols-[8rem_1fr] gap-y-3 text-sm">
      {rows.map(({ label, value }) => (
        <div key={label} className="contents">
          <dt>{label}</dt>
          <dd className={value ? "text-gray-700" : "text-gray-400"}>
            {value || "Not set"}
          </dd>
        </div>
      ))}
    </dl>
  );
};

const EditForm = ({
  user,
  onSaved,
  onCancel,
}: {
  user: UserDetails;
  onSaved: (user: UserDetails) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState(() => toForm(user));
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (field: keyof EditableProfile) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      setError(null);

      onSaved(await updateProfile(form));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to save your profile.",
      );
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      className="flex flex-col gap-3"
    >
      <TextField
        label="Username"
        required
        maxLength={50}
        value={form.username}
        onChange={(e) => {
          setField("username")(e.target.value);
        }}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="First name"
          optional
          maxLength={100}
          value={form.first_name}
          onChange={(e) => {
            setField("first_name")(e.target.value);
          }}
        />
        <TextField
          label="Last name"
          optional
          maxLength={100}
          value={form.last_name}
          onChange={(e) => {
            setField("last_name")(e.target.value);
          }}
        />
      </div>
      <TextField
        label="Phone"
        type="tel"
        optional
        maxLength={50}
        value={form.phone_number}
        onChange={(e) => {
          setField("phone_number")(e.target.value);
        }}
      />
      <TextAreaField
        label="Bio"
        optional
        hint="A few words about your style"
        rows={4}
        maxLength={BIO_LIMIT}
        value={form.bio}
        onChange={(e) => {
          setField("bio")(e.target.value);
        }}
      />
      <p className="-mt-1 text-right text-xs text-gray-500">
        {form.bio.length}/{BIO_LIMIT}
      </p>

      <p className="text-xs text-gray-500">
        Your email ({user.email}) is used to sign in and can't be changed here.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="mt-2 flex items-center gap-4">
        <SubmitButton
          disabled={isSaving || !form.username.trim()}
          className="w-40"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </SubmitButton>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="cursor-pointer text-sm underline disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
