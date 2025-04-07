import crypto from 'crypto';
import fetch from 'node-fetch';

export interface PasswordStats {
  score: number;               // 0-10 score
  entropy: number;             // Bits of entropy
  length: number;              // Password length
  hasUppercase: boolean;       // Contains uppercase letters
  hasLowercase: boolean;       // Contains lowercase letters
  hasNumbers: boolean;         // Contains numbers
  hasSymbols: boolean;         // Contains symbols
  hasCommonPatterns: boolean;  // Contains common patterns (123, qwerty, etc)
  estimatedCrackTime: string;  // Human-readable crack time
  suggestions: string[];       // Improvement suggestions
  breached: boolean;           // Found in data breaches
}

// Common weak patterns to check for
const commonPatterns = [
  '123456', 'password', 'qwerty', 'admin', 'welcome',
  'abc123', 'letmein', '111111', '12345', '123123'
];

// Keyboard pattern sequences
const keyboardPatterns = [
  'qwerty', 'asdfgh', 'zxcvbn', '1qaz', 'qazwsx'
];

export class PasswordService {
  /**
   * Generate a secure random password
   */
  static generatePassword(
    length: number = 16,
    includeUppercase: boolean = true,
    includeLowercase: boolean = true,
    includeNumbers: boolean = true,
    includeSymbols: boolean = true,
    excludeAmbiguous: boolean = false
  ): string {
    // Define character sets
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()-_=+[]{}|;:,.<>?/';
    
    // Remove ambiguous characters if requested
    const ambiguousChars = 'l1IO0';
    
    let availableChars = '';
    if (includeUppercase) availableChars += uppercaseChars;
    if (includeLowercase) availableChars += lowercaseChars;
    if (includeNumbers) availableChars += numberChars;
    if (includeSymbols) availableChars += symbolChars;
    
    if (excludeAmbiguous) {
      for (const char of ambiguousChars) {
        availableChars = availableChars.replace(char, '');
      }
    }
    
    // Ensure we have at least some characters to choose from
    if (!availableChars) {
      availableChars = lowercaseChars + numberChars;
    }
    
    // Generate password
    let password = '';
    const randomBytes = crypto.randomBytes(length * 2); // Get extra bytes to ensure we have enough
    
    for (let i = 0; i < length; i++) {
      const randomIndex = randomBytes[i] % availableChars.length;
      password += availableChars[randomIndex];
    }
    
    // Ensure the password meets all required criteria
    let meetsRequirements = true;
    
    if (includeUppercase && !/[A-Z]/.test(password)) meetsRequirements = false;
    if (includeLowercase && !/[a-z]/.test(password)) meetsRequirements = false;
    if (includeNumbers && !/[0-9]/.test(password)) meetsRequirements = false;
    if (includeSymbols && !/[!@#$%^&*()-_=+[\]{}|;:,.<>?/]/.test(password)) meetsRequirements = false;
    
    // If we don't meet requirements, recursively generate another password
    if (!meetsRequirements) {
      return this.generatePassword(
        length, 
        includeUppercase, 
        includeLowercase, 
        includeNumbers, 
        includeSymbols,
        excludeAmbiguous
      );
    }
    
    return password;
  }
  
  /**
   * Calculate entropy of a password in bits
   */
  static calculateEntropy(password: string): number {
    // Determine character set size
    let charSetSize = 0;
    if (/[a-z]/.test(password)) charSetSize += 26;
    if (/[A-Z]/.test(password)) charSetSize += 26;
    if (/[0-9]/.test(password)) charSetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charSetSize += 33; // Symbols count approximation
    
    // Shannon entropy formula: L * log2(R) where L is length and R is character set size
    return Math.round(password.length * Math.log2(charSetSize));
  }
  
  /**
   * Estimate time to crack a password
   */
  static estimateCrackTime(entropy: number): string {
    // Assuming 10 billion guesses per second (high-end attacker)
    // Crack time = 2^entropy / guesses_per_second / 2 (average case)
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
  
  /**
   * Check if password is in common patterns
   */
  static hasCommonPatterns(password: string): boolean {
    const lowerPass = password.toLowerCase();
    
    // Check against known common passwords
    for (const pattern of commonPatterns) {
      if (lowerPass.includes(pattern)) return true;
    }
    
    // Check keyboard patterns
    for (const pattern of keyboardPatterns) {
      if (lowerPass.includes(pattern)) return true;
    }
    
    // Check for repeated characters (e.g., "aaa", "111")
    if (/(.)\1{2,}/.test(password)) return true;
    
    // Check for sequential characters (e.g., "abc", "123")
    for (let i = 0; i < password.length - 2; i++) {
      const code1 = password.charCodeAt(i);
      const code2 = password.charCodeAt(i + 1);
      const code3 = password.charCodeAt(i + 2);
      
      if (code2 - code1 === 1 && code3 - code2 === 1) return true;
    }
    
    return false;
  }
  
  /**
   * Check if password has been found in known data breaches
   * Uses the Have I Been Pwned API
   */
  static async checkBreachedPassword(password: string): Promise<boolean> {
    try {
      // Create SHA-1 hash of the password
      const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
      
      // Get the prefix (first 5 chars) and suffix for k-anonymity
      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5);
      
      // Query the API with the prefix
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      
      if (!response.ok) {
        console.error('Error checking breached password:', response.statusText);
        return false;
      }
      
      const text = await response.text();
      const lines = text.split('\n');
      
      // Check if our hash suffix appears in the results
      for (const line of lines) {
        const [hashSuffix, count] = line.split(':');
        if (hashSuffix.trim() === suffix) {
          return true; // Password found in breach database
        }
      }
      
      return false; // Password not found in breach database
    } catch (error) {
      console.error('Error checking breached password:', error);
      return false;
    }
  }
  
  /**
   * Analyze password strength comprehensively
   */
  static async analyzePassword(password: string): Promise<PasswordStats> {
    if (!password) {
      return {
        score: 0,
        entropy: 0,
        length: 0,
        hasUppercase: false,
        hasLowercase: false,
        hasNumbers: false,
        hasSymbols: false,
        hasCommonPatterns: false,
        estimatedCrackTime: 'Instantly',
        suggestions: ['Please enter a password'],
        breached: false
      };
    }
    
    // Basic character checks
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    const length = password.length;
    
    // Check for common patterns
    const hasCommonPatterns = this.hasCommonPatterns(password);
    
    // Calculate entropy
    const entropy = this.calculateEntropy(password);
    
    // Estimate crack time
    const estimatedCrackTime = this.estimateCrackTime(entropy);
    
    // Check for breaches (asynchronously)
    const breached = await this.checkBreachedPassword(password);
    
    // Generate suggestions
    const suggestions = [];
    if (length < 12) {
      suggestions.push('Use at least 12 characters');
    }
    if (!hasUppercase) {
      suggestions.push('Add uppercase letters (A-Z)');
    }
    if (!hasLowercase) {
      suggestions.push('Add lowercase letters (a-z)');
    }
    if (!hasNumbers) {
      suggestions.push('Add numbers (0-9)');
    }
    if (!hasSymbols) {
      suggestions.push('Add special characters (!@#$%)');
    }
    if (hasCommonPatterns) {
      suggestions.push('Avoid common patterns and sequences');
    }
    if (breached) {
      suggestions.push('This password has been found in data breaches');
    }
    
    // Calculate final score (0-10)
    let score = 0;
    
    // Length: 0-4 points
    score += Math.min(4, Math.floor(length / 3));
    
    // Character variety: 0-4 points
    score += (hasUppercase ? 1 : 0) + 
             (hasLowercase ? 1 : 0) + 
             (hasNumbers ? 1 : 0) + 
             (hasSymbols ? 1 : 0);
    
    // Deductions for weaknesses: 0-4 points
    if (hasCommonPatterns) score -= 2;
    if (breached) score -= 3;
    
    // Ensure score is within 0-10 range
    score = Math.max(0, Math.min(10, score));
    
    return {
      score,
      entropy,
      length,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSymbols,
      hasCommonPatterns,
      estimatedCrackTime,
      suggestions,
      breached
    };
  }
}
