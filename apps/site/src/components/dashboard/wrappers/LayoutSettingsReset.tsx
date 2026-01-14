"use client";

import { useEffect } from "react";
import { resetLayoutSettings } from "@/utils/resetLayoutSettings";

/**
 * Component that resets layout settings on mount
 * Ensures fresh default settings on each app load
 */
export default function LayoutSettingsReset() {
  useEffect(() => {
    resetLayoutSettings();
  }, []);

  return null;
}
