import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates international and national phone numbers.
 * Allows optional leading '+', digits, spaces, hyphens, and parentheses.
 * Must contain at least 7 digits and at most 16 digits.
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  const cleaned = phone.trim();
  const digitsOnly = cleaned.replace(/\D/g, '');

  if (digitsOnly.length < 8) {
    return { isValid: false, error: 'Phone number is too short (min 8 digits)' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number is too long (max 15 digits)' };
  }

  // Regex checks for standard phone formatting: optional +, digits, spaces, dashes, brackets
  const phonePattern = /^(\+?\d{1,4}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}$/;
  if (!phonePattern.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  return { isValid: true };
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}
