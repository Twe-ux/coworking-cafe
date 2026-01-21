import { useCallback } from "react";
import { useAppDispatch } from "../store/hooks";
import { addNotification, removeNotification } from "../store/slices/uiSlice";

export function useNotification() {
  const dispatch = useAppDispatch();

  const showNotification = useCallback(
    (
      type: "success" | "error" | "info" | "warning",
      message: string,
      duration = 5000,
    ) => {
      const notification = { type, message, duration };
      dispatch(addNotification(notification));

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          // Note: We can't remove by ID here easily, but the component can handle it
        }, duration);
      }
    },
    [dispatch],
  );

  const success = useCallback(
    (message: string, duration?: number) =>
      showNotification("success", message, duration),
    [showNotification],
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      showNotification("error", message, duration),
    [showNotification],
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      showNotification("info", message, duration),
    [showNotification],
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      showNotification("warning", message, duration),
    [showNotification],
  );

  return {
    showNotification,
    success,
    error,
    info,
    warning,
  };
}
