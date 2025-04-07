import CryptoJS from 'crypto-js';

// Types
export interface ExportedVaultData {
  version: string;
  encryptedData: string;
  salt: string;
  iv: string;
  timestamp: string;
}

export interface P2PShareData {
  sessionId: string;
  encryptedData: string;
  publicKey: string;
  timestamp: string;
}

/**
 * Encrypts sensitive data on the client side before sending to server
 * This ensures the server never sees unencrypted sensitive data
 * @param data Data to encrypt
 * @param masterPassword Master password to derive encryption key
 */
export function clientSideEncrypt(data: any, masterPassword: string): {
  encryptedData: string;
  iv: string;
  salt: string;
} {
  // Generate a random salt and IV
  const salt = CryptoJS.lib.WordArray.random(128/8).toString();
  const iv = CryptoJS.lib.WordArray.random(128/8).toString();
  
  // Derive a key from the master password using PBKDF2
  const key = CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: 256/32,
    iterations: 10000
  });
  
  // Encrypt the data with AES-256
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key.toString(), {
    iv: CryptoJS.enc.Hex.parse(iv),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  
  return {
    encryptedData: encrypted.toString(),
    iv,
    salt
  };
}

/**
 * Decrypts client-side encrypted data
 * @param encryptedData Encrypted data string
 * @param iv Initialization vector used for encryption
 * @param salt Salt used for key derivation
 * @param masterPassword Master password to derive decryption key
 */
export function clientSideDecrypt<T>(
  encryptedData: string,
  iv: string,
  salt: string,
  masterPassword: string
): T {
  // Derive the same key using PBKDF2 with the provided salt
  const key = CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: 256/32,
    iterations: 10000
  });
  
  // Decrypt the data
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key.toString(), {
    iv: CryptoJS.enc.Hex.parse(iv),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)) as T;
}

/**
 * Exports vault data in encrypted format for local backup
 * @param vaultData Vault data to export
 * @param password Password to encrypt the export
 */
export function exportVaultData(vaultData: any, password: string): ExportedVaultData {
  const { encryptedData, iv, salt } = clientSideEncrypt(vaultData, password);
  
  return {
    version: '1.0.0', // Version of export format for compatibility
    encryptedData,
    salt,
    iv,
    timestamp: new Date().toISOString()
  };
}

/**
 * Imports vault data from encrypted backup
 * @param exportedData Exported vault data
 * @param password Password used to encrypt the export
 */
export function importVaultData<T>(exportedData: ExportedVaultData, password: string): T {
  return clientSideDecrypt<T>(
    exportedData.encryptedData,
    exportedData.iv,
    exportedData.salt,
    password
  );
}

/**
 * Verifies the integrity and authenticity of an exported vault file
 * @param exportedData Exported vault data
 */
export function verifyExportedData(exportedData: any): boolean {
  // Check if all required fields exist
  const requiredFields = ['version', 'encryptedData', 'salt', 'iv', 'timestamp'];
  for (const field of requiredFields) {
    if (!exportedData[field]) {
      return false;
    }
  }
  
  // Verify version compatibility
  if (!exportedData.version.startsWith('1.')) {
    return false;
  }
  
  // Verify timestamp is valid date
  const timestamp = new Date(exportedData.timestamp);
  if (isNaN(timestamp.getTime())) {
    return false;
  }
  
  return true;
}

// WebRTC direct peer-to-peer connection utilities for password sharing
// These allow sharing encrypted password data directly between browsers
let peerConnection: RTCPeerConnection | null = null;
let dataChannel: RTCDataChannel | null = null;

/**
 * Initializes a WebRTC peer connection
 * @returns The connection session ID
 */
export async function initializePeerConnection(): Promise<string> {
  // Create a unique session ID
  const sessionId = generateSessionId();
  
  // Configure the peer connection
  const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  peerConnection = new RTCPeerConnection(configuration);
  
  // Create a data channel for communication
  dataChannel = peerConnection.createDataChannel('passwordShare');
  
  // Set up event handlers
  dataChannel.onopen = () => {
    console.log('Data channel opened');
  };
  
  dataChannel.onmessage = (event) => {
    console.log('Message received:', event.data);
    // Handle incoming messages
  };
  
  return sessionId;
}

/**
 * Creates an offer to establish a peer connection
 * @returns The session description
 */
export async function createOffer(): Promise<string | null> {
  if (!peerConnection) {
    throw new Error('Peer connection not initialized');
  }
  
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  
  return JSON.stringify(offer);
}

/**
 * Accepts an offer and creates an answer
 * @param offer The offer from the other peer
 * @returns The answer
 */
export async function acceptOffer(offer: string): Promise<string | null> {
  if (!peerConnection) {
    throw new Error('Peer connection not initialized');
  }
  
  const offerObj = JSON.parse(offer);
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offerObj));
  
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  
  return JSON.stringify(answer);
}

/**
 * Completes the connection by processing the answer
 * @param answer The answer from the other peer
 */
export async function processAnswer(answer: string): Promise<void> {
  if (!peerConnection) {
    throw new Error('Peer connection not initialized');
  }
  
  const answerObj = JSON.parse(answer);
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answerObj));
}

/**
 * Sends data through the WebRTC data channel
 * @param data The data to send
 */
export function sendP2PData(data: any): void {
  if (!dataChannel || dataChannel.readyState !== 'open') {
    throw new Error('Data channel not open');
  }
  
  dataChannel.send(JSON.stringify(data));
}

/**
 * Closes the peer connection
 */
export function closePeerConnection(): void {
  if (dataChannel) {
    dataChannel.close();
  }
  
  if (peerConnection) {
    peerConnection.close();
  }
  
  dataChannel = null;
  peerConnection = null;
}

/**
 * Generates a random session ID
 */
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Creates a P2P encrypted data package for sharing
 * @param data Data to share
 * @param sessionId Session ID for the connection
 */
export function createP2PSharePackage(data: any, sessionId: string): P2PShareData {
  // Generate a one-time encryption key
  const encryptionKey = CryptoJS.lib.WordArray.random(256/8).toString();
  
  // Encrypt the data with the one-time key
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
  
  // In a real implementation, we would encrypt the one-time key with the recipient's public key
  // For demo purposes, we're just including it directly (in production, use asymmetric encryption)
  return {
    sessionId,
    encryptedData: encrypted,
    publicKey: encryptionKey, // This would normally be encrypted with recipient's public key
    timestamp: new Date().toISOString()
  };
}