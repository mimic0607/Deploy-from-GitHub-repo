import crypto from 'crypto';

export class CryptoService {
  /**
   * Encrypt text using AES-256-GCM
   * @param text Text to encrypt
   * @param key Encryption key
   * @param iv Initialization vector (optional, will be generated if not provided)
   * @returns Object containing the encrypted data, iv, and auth tag
   */
  static encryptAES(text: string, key: string, iv?: Buffer): { encrypted: string, iv: string, tag: string } {
    // Convert the key to appropriate length (32 bytes for AES-256)
    const derivedKey = crypto
      .createHash('sha256')
      .update(key)
      .digest();
    
    // Generate random IV if not provided
    const initVector = iv || crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, initVector);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the auth tag (for GCM mode)
    const tag = cipher.getAuthTag().toString('hex');
    
    return {
      encrypted,
      iv: initVector.toString('hex'),
      tag
    };
  }
  
  /**
   * Decrypt AES-256-GCM encrypted text
   * @param encryptedData Object containing encrypted data, iv, and auth tag
   * @param key Encryption key
   * @returns Decrypted text
   */
  static decryptAES(encryptedData: { encrypted: string, iv: string, tag: string }, key: string): string {
    try {
      // Convert the key to appropriate length (32 bytes for AES-256)
      const derivedKey = crypto
        .createHash('sha256')
        .update(key)
        .digest();
      
      // Convert IV and auth tag back to buffers
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');
      
      // Create decipher
      const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
      decipher.setAuthTag(tag);
      
      // Decrypt the text
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed. The key may be incorrect.');
    }
  }
  
  /**
   * Create a hash of data using various algorithms
   * @param data Data to hash
   * @param algorithm Hash algorithm to use (sha256, sha512, bcrypt, etc.)
   * @returns Hashed data
   */
  static createHash(data: string, algorithm: string): string {
    switch (algorithm.toLowerCase()) {
      // Standard cryptographic hash functions
      case 'sha256':
        return crypto.createHash('sha256').update(data).digest('hex');
      case 'sha512':
        return crypto.createHash('sha512').update(data).digest('hex');
      case 'md5': // Not recommended for security, but included for compatibility
        return crypto.createHash('md5').update(data).digest('hex');
      case 'sha1': // Not recommended for security, but included for compatibility
        return crypto.createHash('sha1').update(data).digest('hex');
      case 'sha3':
        return crypto.createHash('sha3-256').update(data).digest('hex');
      case 'blake2b':
        return crypto.createHash('blake2b512').update(data).digest('hex');
      case 'blake3':
        // Simulate BLAKE3 (Node.js crypto doesn't directly support it)
        return crypto.createHash('sha3-256')
          .update(crypto.createHash('sha256').update(data).digest())
          .digest('hex') + '_blake3';
      case 'whirlpool':
        return crypto.createHash('whirlpool').update(data).digest('hex');
      case 'ripemd160':
        return crypto.createHash('ripemd160').update(data).digest('hex');
        
      // Password hashing algorithms (in a real app, these would be properly implemented)
      case 'bcrypt':
        // Simulate bcrypt (not actually using bcrypt here, just for UI demo)
        const salt = crypto.randomBytes(16).toString('hex');
        return `$2b$10$${salt}${crypto.createHash('sha256').update(data + salt).digest('hex')}_bcrypt`;
        
      // Argon2 variants
      case 'argon2id':
      case 'argon2i':
      case 'argon2d':
        // Simulate Argon2 (not actually using Argon2 here, just for UI demo)
        const salt2 = crypto.randomBytes(16).toString('hex');
        const memory = '65536'; // 64 MB in KB
        const iterations = '3';
        const parallelism = '4';
        return `$argon2${algorithm.charAt(6)}$v=19$m=${memory},t=${iterations},p=${parallelism}$${salt2}$${
          crypto.createHash('sha512').update(data + salt2).digest('hex')
        }_${algorithm}`;
        
      // Other password-specific algorithms
      case 'scrypt':
        // Simulate scrypt
        const saltScrypt = crypto.randomBytes(16).toString('hex');
        return `$scrypt$ln=16,r=8,p=1$${saltScrypt}$${
          crypto.createHash('sha256').update(data + saltScrypt).digest('hex')
        }_scrypt`;
        
      case 'pbkdf2':
        // Simulate PBKDF2
        const saltPbkdf2 = crypto.randomBytes(16).toString('hex');
        const iterations2 = '600000';
        return `$pbkdf2-sha512$i=${iterations2}$${saltPbkdf2}$${
          crypto.createHash('sha512').update(data + saltPbkdf2).digest('hex')
        }_pbkdf2`;
        
      // Experimental/next-gen
      case 'yescrypt':
      case 'balloon':
      case 'catena':
        // Simulate these experimental algorithms (for UI demo purposes)
        const expSalt = crypto.randomBytes(16).toString('hex');
        return `$${algorithm}$t=3,m=4096$${expSalt}$${
          crypto.createHash('sha3-256').update(data + expSalt).digest('hex')
        }_${algorithm}`;
        
      default:
        throw new Error(`Unsupported hashing algorithm: ${algorithm}`);
    }
  }
  
  /**
   * Compare two hashes for equality (constant-time comparison)
   * @param hash1 First hash
   * @param hash2 Second hash
   * @returns True if hashes match
   */
  static compareHashes(hash1: string, hash2: string): boolean {
    // Use timingSafeEqual to prevent timing attacks
    try {
      return crypto.timingSafeEqual(
        Buffer.from(hash1, 'hex'),
        Buffer.from(hash2, 'hex')
      );
    } catch (error) {
      return false; // Hashes are of different lengths or invalid
    }
  }
  
  /**
   * Generate a cryptographically secure random key
   * @param length Key length in bytes
   * @returns Random key as hex string
   */
  static generateKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
  
  /**
   * Generate a secure token (for email verification, etc.)
   * @param length Token length (default: 6 digits)
   * @returns Numeric token as string
   */
  static generateToken(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    
    // Generate random bytes and convert to a number within our range
    const randomBytes = crypto.randomBytes(4);
    const randomNumber = randomBytes.readUInt32BE(0) % (max - min + 1) + min;
    
    return randomNumber.toString().padStart(length, '0');
  }
  
  /**
   * Encrypt text using Fernet (AES-128-CBC with HMAC)
   * @param text Text to encrypt
   * @param key Encryption key
   * @returns Encrypted data as base64 string
   */
  static encryptFernet(text: string, key: string): string {
    // Derive the key (first 16 bytes for encryption, second 16 bytes for signing)
    const derivedKey = crypto
      .createHash('sha256')
      .update(key)
      .digest();
    
    const encryptionKey = derivedKey.slice(0, 16);
    const signingKey = derivedKey.slice(16, 32);
    
    // Generate a random IV
    const iv = crypto.randomBytes(16);
    
    // Current time (seconds since epoch)
    const now = Math.floor(Date.now() / 1000);
    const timeBytes = Buffer.alloc(8);
    timeBytes.writeBigUInt64BE(BigInt(now));
    
    // Encrypt the text
    const cipher = crypto.createCipheriv('aes-128-cbc', encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Construct the payload (version + time + iv + ciphertext)
    const version = Buffer.from([0x80]); // Fernet version 2
    const payload = Buffer.concat([version, timeBytes, iv, encrypted]);
    
    // Create HMAC signature
    const hmac = crypto.createHmac('sha256', signingKey);
    hmac.update(payload);
    const signature = hmac.digest();
    
    // Final token is payload + signature
    const token = Buffer.concat([payload, signature]);
    
    return token.toString('base64');
  }
  
  /**
   * Decrypt Fernet-encrypted data
   * @param encryptedData Encrypted data as base64 string
   * @param key Encryption key
   * @returns Decrypted text
   */
  static decryptFernet(encryptedData: string, key: string): string {
    try {
      // Derive the key (first 16 bytes for encryption, second 16 bytes for signing)
      const derivedKey = crypto
        .createHash('sha256')
        .update(key)
        .digest();
      
      const encryptionKey = derivedKey.slice(0, 16);
      const signingKey = derivedKey.slice(16, 32);
      
      // Decode the token
      const token = Buffer.from(encryptedData, 'base64');
      
      // Extract components
      const version = token[0];
      const timeBytes = token.slice(1, 9);
      const iv = token.slice(9, 25);
      const ciphertext = token.slice(25, token.length - 32);
      const storedSignature = token.slice(token.length - 32);
      
      // Verify version
      if (version !== 0x80) {
        throw new Error('Invalid token version');
      }
      
      // Verify signature
      const payload = token.slice(0, token.length - 32);
      const hmac = crypto.createHmac('sha256', signingKey);
      hmac.update(payload);
      const calculatedSignature = hmac.digest();
      
      if (!crypto.timingSafeEqual(calculatedSignature, storedSignature)) {
        throw new Error('Invalid signature');
      }
      
      // Decrypt the ciphertext
      const decipher = crypto.createDecipheriv('aes-128-cbc', encryptionKey, iv);
      let decrypted = decipher.update(ciphertext);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error('Decryption failed. The key may be incorrect.');
    }
  }
}
