import type { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

/**
 * Resolve a Lucide icon component from a string name with graceful fallback.
 * Accepts names in various casings (e.g. "shield", "Shield", "shield-check").
 */
export const resolveLucideIcon = (
  iconName?: string | null,
  fallback: LucideIcon = Icons.Target
): LucideIcon => {
  if (!iconName) {
    return fallback;
  }

  const trimmed = iconName.trim();
  if (!trimmed) {
    return fallback;
  }

  const iconLibrary = Icons as unknown as Record<string, LucideIcon>;

  // Try direct match first (e.g. "Shield")
  if (iconLibrary[trimmed]) {
    return iconLibrary[trimmed];
  }

  // Convert strings like "shield", "shield-check", "shield check" to PascalCase: "Shield", "ShieldCheck"
  const pascalCase = trimmed
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');

  if (pascalCase && iconLibrary[pascalCase]) {
    return iconLibrary[pascalCase];
  }

  // Try capitalising first character only (covers simple kebab-case misses)
  const capitalised = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  if (iconLibrary[capitalised]) {
    return iconLibrary[capitalised];
  }

  return fallback;
};
