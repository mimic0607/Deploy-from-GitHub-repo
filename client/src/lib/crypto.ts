import CryptoJS from 'crypto-js';
import { apiRequest } from '@/lib/queryClient';
import type { 
  EncryptionResult, 
  DecryptionRequest, 
  HashResult, 
  EncryptionAlgorithm, 
  HashingAlgorithm 
} from '@/types';

export async function encryptText(
  text: string, 
  key: string, 
  algorithm: EncryptionAlgorithm = 'aes'
): Promise<EncryptionResult> {
  try {
    // Client-side encryption for algorithms not supported by the server
    if (algorithm === 'tripledes' || algorithm === 'blowfish') {
      let encryptedText = '';
      
      if (algorithm === 'tripledes') {
        encryptedText = CryptoJS.TripleDES.encrypt(text, key).toString();
      } else if (algorithm === 'blowfish') {
        // Note: CryptoJS doesn't have native Blowfish, this is a placeholder
        // In a real implementation, you'd use a proper Blowfish library
        encryptedText = CryptoJS.AES.encrypt(text, key).toString();
      }
      
      return { encrypted: encryptedText };
    }
    
    // Server-side encryption for supported algorithms
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
    // Client-side decryption for algorithms not supported by the server
    if (data.algorithm === 'tripledes' || data.algorithm === 'blowfish') {
      let decryptedText = '';
      
      if (data.algorithm === 'tripledes') {
        const bytes = CryptoJS.TripleDES.decrypt(data.encrypted, data.key);
        decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      } else if (data.algorithm === 'blowfish') {
        // Note: CryptoJS doesn't have native Blowfish, this is a placeholder
        const bytes = CryptoJS.AES.decrypt(data.encrypted, data.key);
        decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      }
      
      return decryptedText;
    }
    
    // Server-side decryption for supported algorithms
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
  algorithm: HashingAlgorithm = 'sha256'
): Promise<HashResult> {
  try {
    // Client-side hashing for algorithms not supported by the server
    if (algorithm === 'blake2b' || algorithm === 'ripemd160') {
      let hash = '';
      
      if (algorithm === 'ripemd160') {
        hash = CryptoJS.RIPEMD160(text).toString();
      } else if (algorithm === 'blake2b') {
        // Note: CryptoJS doesn't have native BLAKE2b, this is a placeholder
        // In a real implementation, you'd use a proper BLAKE2b library
        hash = CryptoJS.SHA3(text, { outputLength: 256 }).toString();
      }
      
      return { hash };
    }
    
    // Server-side hashing for supported algorithms
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
