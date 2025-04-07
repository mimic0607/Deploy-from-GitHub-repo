import CryptoJS from 'crypto-js';
import { apiRequest } from '@/lib/queryClient';
import type { EncryptionResult, DecryptionRequest, HashResult } from '@/types';

export async function encryptText(
  text: string, 
  key: string, 
  algorithm: 'aes' | 'fernet' = 'aes'
): Promise<EncryptionResult> {
  try {
    const response = await apiRequest('POST', '/api/encrypt', {
      text,
      key,
      algorithm
    });
    
    return await response.json();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt text');
  }
}

export async function decryptText(
  data: DecryptionRequest
): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/decrypt', data);
    const result = await response.json();
    return result.decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt text');
  }
}

export async function hashText(
  text: string,
  algorithm: 'sha256' | 'sha512' | 'md5' = 'sha256'
): Promise<HashResult> {
  try {
    const response = await apiRequest('POST', '/api/hash', {
      text,
      algorithm
    });
    
    return await response.json();
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash text');
  }
}

export async function compareHashes(hash1: string, hash2: string): Promise<boolean> {
  try {
    const response = await apiRequest('POST', '/api/compare-hashes', {
      hash1,
      hash2
    });
    
    const result = await response.json();
    return result.match;
  } catch (error) {
    console.error('Hash comparison error:', error);
    throw new Error('Failed to compare hashes');
  }
}

// Client-side encryption for sensitive data that doesn't need to go to the server
export function encryptClientSide(text: string, key: string): string {
  return CryptoJS.AES.encrypt(text, key).toString();
}

export function decryptClientSide(encryptedText: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
