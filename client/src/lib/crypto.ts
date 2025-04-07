import CryptoJS from 'crypto-js';
import { apiRequest } from '@/lib/queryClient';
import type { 
  EncryptionResult, 
  DecryptionRequest, 
  HashResult, 
  EncryptionAlgorithm, 
  HashingAlgorithm,
  EncryptionType
} from '@/types';

// Simple implementation of password-based key derivation
export function deriveKeyFromPassword(password: string, salt = 'secure-password-vault'): string {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
}

// Mock RSA implementation (in a real app, use a proper RSA library)
const mockRsaEncrypt = (text: string, publicKey: string): string => {
  // This is just a simple placeholder in lieu of actual RSA
  // In a real app, use a proper RSA implementation
  return CryptoJS.AES.encrypt(text, publicKey).toString();
};

const mockRsaDecrypt = (encryptedText: string, privateKey: string): string => {
  // This is just a simple placeholder in lieu of actual RSA
  // In a real app, use a proper RSA implementation
  const bytes = CryptoJS.AES.decrypt(encryptedText, privateKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const generateMockRsaKeyPair = (): { publicKey: string, privateKey: string } => {
  // In a real implementation, this would generate actual RSA keys
  const seed = Math.random().toString(36).substring(2, 15);
  return {
    publicKey: `public-${seed}`,
    privateKey: `private-${seed}`
  };
};

export async function encryptText(
  text: string, 
  key: string, 
  algorithm: EncryptionAlgorithm = 'aes'
): Promise<EncryptionResult> {
  try {
    // RSA encryption (asymmetric)
    if (algorithm === 'rsa') {
      // In a real implementation, the key would be the public key
      // For our mock implementation, we'll generate a key pair
      const keyPair = generateMockRsaKeyPair();
      const encryptedText = mockRsaEncrypt(text, keyPair.publicKey);
      
      return { 
        encrypted: encryptedText,
        publicKey: keyPair.publicKey, 
        tag: keyPair.privateKey  // We're storing the private key in the tag for demo purposes
      };
    }
    
    // Client-side encryption for algorithms not supported by the server
    if (['tripledes', 'blowfish', 'chacha20', 'twofish', 'serpent', 'ecc', 'ed25519', 'x25519'].includes(algorithm)) {
      let encryptedText = '';
      
      if (algorithm === 'tripledes') {
        encryptedText = CryptoJS.TripleDES.encrypt(text, key).toString();
      } else if (algorithm === 'blowfish') {
        // Note: CryptoJS doesn't have native Blowfish, this is a placeholder
        // In a real implementation, you'd use a proper Blowfish library
        encryptedText = CryptoJS.AES.encrypt(text, key + '_blowfish').toString();
      } else if (algorithm === 'chacha20') {
        // Simulating ChaCha20 with AES for the demo
        // In a real implementation, use a proper ChaCha20 library
        encryptedText = CryptoJS.AES.encrypt(text, key + '_chacha20').toString();
      } else if (algorithm === 'twofish') {
        // Simulating Twofish with AES for the demo
        // In a real implementation, use a proper Twofish library
        encryptedText = CryptoJS.AES.encrypt(text, key + '_twofish').toString();
      } else if (algorithm === 'serpent') {
        // Simulating Serpent with AES for the demo
        // In a real implementation, use a proper Serpent library
        encryptedText = CryptoJS.AES.encrypt(text, key + '_serpent').toString();
      } else if (['ecc', 'ed25519', 'x25519'].includes(algorithm)) {
        // For demo purposes, simulate these with RSA-like behavior
        const keyPair = generateMockRsaKeyPair();
        encryptedText = mockRsaEncrypt(text, keyPair.publicKey);
        
        return { 
          encrypted: encryptedText,
          publicKey: keyPair.publicKey, 
          tag: keyPair.privateKey  // Storing private key in tag for demo
        };
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
    // Asymmetric decryption
    if (['rsa', 'ecc', 'ed25519', 'x25519'].includes(data.algorithm)) {
      // In our mock implementation, the private key is stored in the tag
      return mockRsaDecrypt(data.encrypted, data.tag || '');
    }
    
    // Client-side decryption for algorithms not supported by the server
    if (['tripledes', 'blowfish', 'chacha20', 'twofish', 'serpent'].includes(data.algorithm)) {
      let decryptedText = '';
      
      if (data.algorithm === 'tripledes') {
        const bytes = CryptoJS.TripleDES.decrypt(data.encrypted, data.key);
        decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      } else if (data.algorithm === 'blowfish') {
        // Note: CryptoJS doesn't have native Blowfish, this is a placeholder
        const bytes = CryptoJS.AES.decrypt(data.encrypted, data.key + '_blowfish');
        decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      } else if (data.algorithm === 'chacha20') {
        // Simulating ChaCha20 with AES for the demo
        const bytes = CryptoJS.AES.decrypt(data.encrypted, data.key + '_chacha20');
        decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      } else if (data.algorithm === 'twofish') {
        // Simulating Twofish with AES for the demo
        const bytes = CryptoJS.AES.decrypt(data.encrypted, data.key + '_twofish');
        decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      } else if (data.algorithm === 'serpent') {
        // Simulating Serpent with AES for the demo
        const bytes = CryptoJS.AES.decrypt(data.encrypted, data.key + '_serpent');
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
    if (['blake2b', 'ripemd160', 'sha3', 'blake3', 'whirlpool'].includes(algorithm)) {
      let hash = '';
      
      if (algorithm === 'ripemd160') {
        hash = CryptoJS.RIPEMD160(text).toString();
      } else if (algorithm === 'blake2b') {
        // Note: CryptoJS doesn't have native BLAKE2b, this is a placeholder
        // In a real implementation, you'd use a proper BLAKE2b library
        hash = CryptoJS.SHA3(text, { outputLength: 256 }).toString();
      } else if (algorithm === 'sha3') {
        hash = CryptoJS.SHA3(text, { outputLength: 512 }).toString();
      } else if (algorithm === 'blake3') {
        // Simulate BLAKE3 with SHA3 for the demo
        hash = CryptoJS.SHA3(text, { outputLength: 256 }).toString();
      } else if (algorithm === 'whirlpool') {
        // Simulate Whirlpool with SHA512 for the demo
        hash = CryptoJS.SHA512(text).toString();
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
