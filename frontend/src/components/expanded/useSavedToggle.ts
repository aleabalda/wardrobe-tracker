import { useState } from "react";

/**
 * Saves the thing optimistically and reverts if the request fails.
 * `save` resolves to the value the server stored.
 */
export const useSavedToggle = (
  save: (isSaved: boolean) => Promise<boolean>,
) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const toggle = async () => {
    if (isUpdating) return;

    const newValue = !isSaved;
    setIsSaved(newValue);
    setIsUpdating(true);

    try {
      setIsSaved(await save(newValue));
    } catch (error) {
      console.error("Failed to update saved state:", error);
      setIsSaved(!newValue);
    } finally {
      setIsUpdating(false);
    }
  };

  // setIsSaved syncs it once the thing being saved has loaded
  return { isSaved, setIsSaved, isUpdating, toggle };
};
