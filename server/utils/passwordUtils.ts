/**
 * Check if a password is about to expire within the given number of days
 * @param expiryDate - The password expiry date (as string, Date, or null/undefined)
 * @param daysWarning - Number of days before expiry to start warning
 * @returns True if the password will expire within the warning period
 */
export function isPasswordExpiring(expiryDate: string | Date | null | undefined, daysWarning: number = 7): boolean {
  if (!expiryDate) return false;
  
  try {
    // Convert to Date object if it's a string
    const expiry = expiryDate instanceof Date ? expiryDate : new Date(expiryDate.toString());
    const now = new Date();
    
    // Calculate the difference in days
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Password is expiring if it's within the warning period but not already expired
    return diffDays >= 0 && diffDays <= daysWarning;
  } catch {
    return false;
  }
}

/**
 * Check if a password has already expired
 * @param expiryDate - The password expiry date (as string, Date, or null/undefined)
 * @returns True if the password has expired
 */
export function isPasswordExpired(expiryDate: string | Date | null | undefined): boolean {
  if (!expiryDate) return false;
  
  try {
    // Convert to Date object if it's a string
    const expiry = expiryDate instanceof Date ? expiryDate : new Date(expiryDate.toString());
    const now = new Date();
    
    // Password is expired if expiry date is in the past
    return expiry < now;
  } catch {
    return false;
  }
}