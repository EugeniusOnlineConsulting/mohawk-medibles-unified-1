/**
 * Phone Number Validation — Mohawk Medibles
 * Validates and formats Canadian phone numbers to E.164 format.
 */

/**
 * Validates a Canadian phone number.
 * Accepts formats: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXXXXXXXXX, 1XXXXXXXXXX, +1XXXXXXXXXX
 * Returns { valid, reason? }
 */
export function validatePhone(phone: string): { valid: boolean; reason?: string } {
  if (!phone || typeof phone !== "string") {
    return { valid: false, reason: "Phone number is required" };
  }

  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Must be 10 digits (Canadian local) or 11 digits starting with 1 (with country code)
  if (digits.length === 10) {
    // Area code cannot start with 0 or 1
    if (digits[0] === "0" || digits[0] === "1") {
      return { valid: false, reason: "Invalid area code" };
    }
    return { valid: true };
  }

  if (digits.length === 11 && digits[0] === "1") {
    // Area code cannot start with 0 or 1
    if (digits[1] === "0" || digits[1] === "1") {
      return { valid: false, reason: "Invalid area code" };
    }
    return { valid: true };
  }

  return { valid: false, reason: "Phone number must be 10 digits (Canadian format)" };
}

/**
 * Formats a phone number to E.164 format (+1XXXXXXXXXX).
 * Returns null if the number is invalid.
 */
export function formatPhone(phone: string): string | null {
  const { valid } = validatePhone(phone);
  if (!valid) return null;

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits[0] === "1") {
    return `+${digits}`;
  }

  return null;
}

/**
 * Masks a phone number for display (e.g., +1******1234)
 */
export function maskPhone(phone: string): string {
  if (!phone) return "N/A";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  const last4 = digits.slice(-4);
  return `+1******${last4}`;
}
