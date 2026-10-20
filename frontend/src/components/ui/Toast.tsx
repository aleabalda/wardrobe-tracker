import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";

type ToastProps = {
  message: string | null;
  onClose: () => void;
  duration?: number;
};

// Shows a message at the top of the screen while `message` is set,
// then calls onClose after `duration` ms.
export const Toast = ({ message, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    if (!message) return;

    const timeout = setTimeout(onClose, duration);
    return () => {
      clearTimeout(timeout);
    };
  }, [message, onClose, duration]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2 }}
          className="fixed top-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded border border-black bg-white px-4 py-3 text-sm shadow-lg"
        >
          <CheckCircleOutlineIcon fontSize="small" className="text-green-600" />
          <p>{message}</p>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-black"
          >
            <CloseIcon fontSize="small" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
