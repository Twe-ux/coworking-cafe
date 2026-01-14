/**
 * Reset layout settings from localStorage
 * This ensures fresh settings on each app load
 */
export const resetLayoutSettings = () => {
  if (typeof window !== 'undefined') {
    const key = '__REBACK_NEXT_CONFIG__';

    // Remove old settings
    localStorage.removeItem(key);
  }
};

/**
 * Clear specific layout setting
 */
export const clearLayoutSetting = (settingKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(settingKey);
  }
};
