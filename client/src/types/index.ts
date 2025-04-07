// User Types
export interface User {
  id: number;
  username: string;
  email?: string;
  twoFactorEnabled: boolean;
}

// Vault Types
export interface VaultItem {
  id: number;
  userId: number;
  name: string;
  url?: string;
  username: string;
  password: string;
  category?: string;
  notes?: string;
  createdAt: string;
  lastUsed?: string;
  expiryDate?: string;
}

export interface NewVaultItem {
  userId: number;
  name: string;
  url?: string;
  username: string;
  password: string;
  category?: string;
  notes?: string;
  expiryDate?: string;
}

// Password Strength Types
export interface PasswordStrength {
  score: number;
  entropy: number;
  length: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  hasCommonPatterns: boolean;
  estimatedCrackTime: string;
  suggestions: string[];
  breached: boolean;
}

// Password Generator Types
export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}

export interface GeneratedPassword {
  password: string;
  entropy: number;
  crackTime: string;
}

// Crypto Types
export type EncryptionType = 'symmetric' | 'asymmetric';
export type EncryptionAlgorithm = 'aes' | 'fernet' | 'tripledes' | 'blowfish' | 'rsa';
export type SymmetricAlgorithm = 'aes' | 'fernet' | 'tripledes' | 'blowfish';
export type AsymmetricAlgorithm = 'rsa';
export type HashingAlgorithm = 'sha256' | 'sha512' | 'md5' | 'blake2b' | 'ripemd160';

export interface EncryptionResult {
  encrypted: string;
  iv?: string;
  tag?: string;
  publicKey?: string; // For asymmetric encryption
}

export interface DecryptionRequest {
  encrypted: string;
  iv?: string;
  tag?: string;
  key: string;
  algorithm: EncryptionAlgorithm;
}

export interface HashingRequest {
  text: string;
  algorithm: HashingAlgorithm;
}

export interface HashResult {
  hash: string;
}

export interface CryptoDocument {
  id: number;
  userId: number;
  type: 'encrypted' | 'hashed';
  name: string;
  data: string;
  algorithm: string;
  createdAt: string;
}

// Password Sharing Types
export interface PasswordShare {
  id: number;
  senderId: number;
  vaultItemId: number;
  recipientEmail: string;
  encryptedData: string;
  expiresAt?: string;
  accessCode?: string;
  createdAt: string;
}

export interface NewPasswordShare {
  senderId: number;
  vaultItemId: number;
  recipientEmail: string;
  encryptedData: string;
  expiresAt?: string;
  accessCode?: string;
}

// Categories
export const VaultCategories = [
  'Social',
  'Banking',
  'Shopping',
  'Work',
  'Entertainment',
  'Email',
  'Education',
  'Health',
  'Travel',
  'Other'
] as const;

export type VaultCategory = typeof VaultCategories[number];

// Password Health Dashboard
export interface PasswordHealthSummary {
  overallScore: number;
  strongCount: number;
  mediumCount: number;
  weakCount: number;
  totalCount: number;
  breachedCount: number;
  expiringCount: number;
  reusedCount: number;
  recentlyChanged: VaultItem[];
}
