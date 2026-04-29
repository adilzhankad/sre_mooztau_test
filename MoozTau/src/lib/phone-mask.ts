/**
 * Format phone: always starts with +7, then (XXX) XXX-XX-XX
 * Input: any digits → Output: +7 (700) 123-45-67
 */
export function formatPhone(raw: string): string {
  // Strip everything except digits
  const digits = raw.replace(/\D/g, "");

  // Remove leading 7 or 8 if user typed it (we add +7 automatically)
  let d = digits;
  if (d.startsWith("77") || d.startsWith("87")) {
    d = d.slice(1);
  } else if (d.startsWith("7") && d.length > 1) {
    d = d.slice(1);
  } else if (d.startsWith("8") && d.length > 1) {
    d = d.slice(1);
  }

  // Limit to 10 digits (after +7)
  d = d.slice(0, 10);

  // Build formatted string
  let result = "+7";
  if (d.length > 0) result += " (" + d.slice(0, 3);
  if (d.length >= 3) result += ") ";
  if (d.length > 3) result += d.slice(3, 6);
  if (d.length > 6) result += "-" + d.slice(6, 8);
  if (d.length > 8) result += "-" + d.slice(8, 10);

  return result;
}

/**
 * Get raw phone for API: +7XXXXXXXXXX
 */
export function rawPhone(formatted: string): string {
  const digits = formatted.replace(/\D/g, "");
  if (digits.startsWith("7") && digits.length === 11) return "+" + digits;
  if (digits.length === 10) return "+7" + digits;
  return "+" + digits;
}
