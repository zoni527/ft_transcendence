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

// Helper function to check for valid characters
export const hasControlChars = (value: string) =>
  Array.from(value).some((c) => {
    const code = c.codePointAt(0)!;
    return code <= 31 || code === 127;
  });

// Validation for a valid fullName
export function isValidName(name: string): boolean {
  name = name.trim();

  if (name === '') {
    return false;
  }

  let letters = 0;
  let prevSep = false;

  for (let i = 0; i < name.length; ) {
    const codePoint = name.codePointAt(i)!;
    const char = String.fromCodePoint(codePoint);

    const isLetter = /^\p{L}$/u.test(char);
    const isSep = char === ' ' || char === "'" || char === '-';

    if (!isLetter && !isSep) {
      return false;
    }

    if (isLetter) {
      letters++;
      prevSep = false;
    } else {
      const nextIndex = i + char.length;

      if (i === 0 || nextIndex === name.length) {
        return false;
      }

      if (prevSep) {
        return false;
      }

      prevSep = true;
    }

    i += char.length;
  }

  return letters >= 2;
}

// Validation for username
export function isValidDisplayName(displayName: string): boolean {
  displayName = displayName.trim();

  if (displayName === '') {
    return false;
  }

  const chars = Array.from(displayName);

  if (chars.length < 3 || chars.length > 30) {
    return false;
  }

  let hasAlphaNum = false;
  let prevSep = false;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    const isAlphaNum = /^\p{L}$/u.test(char) || /^\p{N}$/u.test(char);

    const isSep = char === '_' || char === '.' || char === '-';

    if (!isAlphaNum && !isSep) {
      return false;
    }

    if (isAlphaNum) {
      hasAlphaNum = true;
      prevSep = false;
      continue;
    }

    if (i === 0 || i === chars.length - 1) {
      return false;
    }

    if (prevSep) {
      return false;
    }

    prevSep = true;
  }

  return hasAlphaNum;
}
