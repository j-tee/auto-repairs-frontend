

// Utility functions for safe type conversion
export const safeParseFloat = (value: string | number | undefined | null): number => {
  if (value === null || value === undefined) return 0;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
};

export const safeParseInt = (value: string | number | undefined | null): number => {
  if (value === null || value === undefined) return 0;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? 0 : parsed;
};
