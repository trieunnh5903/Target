export function useValidation() {
  const validateDisplayName = (value: string): string | null => {
    // console.log("value", value);s

    if (!value.trim()) return "Display name is required";
    if (value.length < 2) return "Display name must be at least 2 characters";
    if (value.length > 50)
      return "Display name must be less than 50 characters";
    if (!/^[a-zA-Z0-9\s._-]+$/.test(value)) {
      return "Display name can only contain letters, numbers, spaces, and ._-";
    }
    return null;
  };

  return { validateDisplayName };
}
