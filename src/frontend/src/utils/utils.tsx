// Helper to safely get string values from a form field
export function getStringValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value === 'string') return value.trim();
  return '';
}
