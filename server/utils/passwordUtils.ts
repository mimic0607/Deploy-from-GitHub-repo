/**
 * Check if a password is about to expire within the given number of days
 * @param expiryDate - The password expiry date (as string, Date, or null/undefined)
 * @param daysWarning - Number of days before expiry to start warning
 * @returns True if the password will expire within the warning period
 */
export function isPasswordExpiring(expiryDate: string | Date | null | undefined, daysWarning: number = 7): boolean {
  if (!expiryDate) return false;
  
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const today = new Date();
  
  // Calculate warning date (today + warning period)
  const warningDate = new Date(today);
  warningDate.setDate(today.getDate() + daysWarning);
  
  // A password is expiring if its expiry date is before the warning date but after today
  return expiry > today && expiry <= warningDate;
}

/**
 * Check if a password has already expired
 * @param expiryDate - The password expiry date (as string, Date, or null/undefined)
 * @returns True if the password has expired
 */
export function isPasswordExpired(expiryDate: string | Date | null | undefined): boolean {
  if (!expiryDate) return false;
  
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const today = new Date();
  
  // A password is expired if its expiry date is before today
  return expiry < today;
}