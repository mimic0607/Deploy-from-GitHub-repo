import { apiRequest } from '@/lib/queryClient';
import type { 
  PasswordStrength, 
  PasswordGeneratorOptions, 
  GeneratedPassword 
} from '@/types';

// Calculate password entropy on the client-side
export function calculatePasswordEntropy(password: string): number {
  if (!password) return 0;
  
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33;
  
  return Math.round(password.length * Math.log2(charsetSize));
}

// Analyze password strength (sends to server for full analysis)
export async function analyzePassword(password: string): Promise<PasswordStrength> {
  try {
    const response = await apiRequest('POST', '/api/analyze-password', { password });
    return await response.json();
  } catch (error) {
    console.error('Password analysis error:', error);
    throw new Error('Failed to analyze password');
  }
}

// Generate a secure password
export async function generatePassword(
  options: PasswordGeneratorOptions
): Promise<GeneratedPassword> {
  try {
    const response = await apiRequest('POST', '/api/generate-password', options);
    return await response.json();
  } catch (error) {
    console.error('Password generation error:', error);
    throw new Error('Failed to generate password');
  }
}

// Estimate crack time based on entropy
export function estimateCrackTime(entropy: number): string {
  // Assuming 10 billion guesses per second (high-end attacker)
  const secondsToCrack = Math.pow(2, entropy) / (10 * Math.pow(10, 9)) / 2;
  
  if (secondsToCrack < 1) {
    return 'Instantly';
  } else if (secondsToCrack < 60) {
    return `${Math.round(secondsToCrack)} seconds`;
  } else if (secondsToCrack < 3600) {
    return `${Math.round(secondsToCrack / 60)} minutes`;
  } else if (secondsToCrack < 86400) {
    return `${Math.round(secondsToCrack / 3600)} hours`;
  } else if (secondsToCrack < 31536000) {
    return `${Math.round(secondsToCrack / 86400)} days`;
  } else if (secondsToCrack < 31536000 * 100) {
    return `${Math.round(secondsToCrack / 31536000)} years`;
  } else {
    return 'Centuries';
  }
}

// Check if a password is considered weak
export function isWeakPassword(password: string): boolean {
  // Basic check - a more comprehensive check would use the API
  if (!password) return true;
  if (password.length < 8) return true;
  if (!/[A-Z]/.test(password)) return true;
  if (!/[a-z]/.test(password)) return true;
  if (!/[0-9]/.test(password)) return true;
  if (!/[^A-Za-z0-9]/.test(password)) return true;
  
  // Check for common patterns
  const commonPatterns = [
    '123456', 'password', 'qwerty', 'admin', 'welcome',
    'abc123', 'letmein', '111111', '12345', '123123'
  ];
  
  for (const pattern of commonPatterns) {
    if (password.toLowerCase().includes(pattern)) return true;
  }
  
  return false;
}

// Check if a password is about to expire
export function isPasswordExpiring(expiryDate?: string, daysWarning: number = 7): boolean {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  const warningDate = new Date();
  warningDate.setDate(today.getDate() + daysWarning);
  
  return expiry <= warningDate && expiry >= today;
}

// Check if a password has expired
export function isPasswordExpired(expiryDate?: string): boolean {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  
  return expiry < today;
}

// Calculate strength from 0-10
export function calculateStrengthScore(
  length: number,
  hasUpper: boolean,
  hasLower: boolean,
  hasNumber: boolean,
  hasSymbol: boolean,
  hasCommonPatterns: boolean,
  breached: boolean
): number {
  let score = 0;
  
  // Length: 0-4 points
  score += Math.min(4, Math.floor(length / 3));
  
  // Character variety: 0-4 points
  score += (hasUpper ? 1 : 0) + 
           (hasLower ? 1 : 0) + 
           (hasNumber ? 1 : 0) + 
           (hasSymbol ? 1 : 0);
  
  // Deductions for weaknesses
  if (hasCommonPatterns) score -= 2;
  if (breached) score -= 3;
  
  // Ensure score is within 0-10 range
  return Math.max(0, Math.min(10, score));
}
