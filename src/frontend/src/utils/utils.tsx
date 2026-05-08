import type { TFunction } from 'i18next';

// Helper to safely get string values from a form field
export function getStringValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value === 'string') return value.trim();
  return '';
}

// Helper function to validate an image file
export function validateImageFile(
  file: File | null,
  t: TFunction,
  options?: { maxSizeMB?: number; allowedTypes?: string[] },
): File | null {
  if (!file) return null;

  const maxSizeMB = options?.maxSizeMB ?? 5;
  const allowedTypes = options?.allowedTypes ?? [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(t('error.invalidFileType'));
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(t('error.fileTooLarge', { maxSizeMB }));
  }

  return file;
}
