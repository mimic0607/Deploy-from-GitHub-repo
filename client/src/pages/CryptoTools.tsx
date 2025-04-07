import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CryptoTools from '@/components/crypto-tools/CryptoTools';

export default function CryptoToolsPage() {
  return (
    <AppLayout title="Cryptographic Tools">
      {/* Introduction */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Cryptographic Tools</h2>
        <p className="text-gray-300 mb-4">
          Our cryptographic tools provide secure methods for encrypting, decrypting, and hashing sensitive information.
          All cryptographic operations are performed locally in your browser for maximum security and privacy.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-primary/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Encryption & Decryption</h3>
            <p className="text-sm text-gray-300 mb-3">
              Encrypt sensitive information so that it can only be read by someone with the correct decryption key.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>
                  <strong>AES-256:</strong> Advanced Encryption Standard with 256-bit keys, used by governments and banks.
                </span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>
                  <strong>Fernet:</strong> Symmetric encryption that guarantees that a message encrypted cannot be manipulated or read without the key.
                </span>
              </li>
            </ul>
          </div>
          
          <div className="bg-purple-primary/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Hashing Algorithms</h3>
            <p className="text-sm text-gray-300 mb-3">
              Generate a fixed-size output (hash) from any input. Hashes are one-way operations and cannot be reversed.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 7 4 4 20 4 20 7" />
                  <line x1="9" x2="15" y1="20" y2="20" />
                  <line x1="12" x2="12" y1="4" y2="20" />
                </svg>
                <span>
                  <strong>SHA-256:</strong> Widely used for security applications and cryptocurrencies.
                </span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 7 4 4 20 4 20 7" />
                  <line x1="9" x2="15" y1="20" y2="20" />
                  <line x1="12" x2="12" y1="4" y2="20" />
                </svg>
                <span>
                  <strong>SHA-512:</strong> More secure variant with longer output.
                </span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-primary mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 7 4 4 20 4 20 7" />
                  <line x1="9" x2="15" y1="20" y2="20" />
                  <line x1="12" x2="12" y1="4" y2="20" />
                </svg>
                <span>
                  <strong>MD5:</strong> Faster but less secure algorithm (not recommended for security-critical applications).
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* CryptoTools Component */}
      <CryptoTools />
      
      {/* Use Cases */}
      <div className="glass-card rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Common Use Cases</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Encryption</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-2 mt-0.5">1</span>
                <span>Protecting sensitive notes, documents, or messages</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-2 mt-0.5">2</span>
                <span>Securely sharing confidential information with a recipient</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-2 mt-0.5">3</span>
                <span>Creating secure backups of important information</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Hashing</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-2 mt-0.5">1</span>
                <span>Verifying file integrity after download or transfer</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-2 mt-0.5">2</span>
                <span>Comparing data to check if it has been modified</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-2 mt-0.5">3</span>
                <span>Creating unique identifiers for data</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-purple-primary/20">
          <p className="text-sm text-warning flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
            <strong>Important:</strong> Always use strong encryption keys and store them securely. If you lose your encryption key, there is no way to recover your encrypted data.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
