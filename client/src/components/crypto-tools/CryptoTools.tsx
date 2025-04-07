import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { encryptText, decryptText, hashText } from '@/lib/crypto';
import { copyToClipboard } from '@/lib/utils';

export default function CryptoTools() {
  const { toast } = useToast();
  
  // Encryption state
  const [encryptionMethod, setEncryptionMethod] = useState<'aes' | 'fernet' | 'tripledes' | 'blowfish'>('aes');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [textToEncrypt, setTextToEncrypt] = useState('');
  const [encryptedResult, setEncryptedResult] = useState<{
    encrypted: string;
    iv?: string;
    tag?: string;
  } | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  
  // Hashing state
  const [hashAlgorithm, setHashAlgorithm] = useState<'sha256' | 'sha512' | 'md5' | 'blake2b' | 'ripemd160'>('sha256');
  const [textToHash, setTextToHash] = useState('');
  const [hashResult, setHashResult] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  
  const handleEncrypt = async () => {
    if (!textToEncrypt) {
      toast({
        title: "Input required",
        description: "Please enter text to encrypt",
        variant: "destructive"
      });
      return;
    }
    
    if (!encryptionKey) {
      toast({
        title: "Key required",
        description: "Please enter an encryption key",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsEncrypting(true);
      const result = await encryptText(textToEncrypt, encryptionKey, encryptionMethod);
      setEncryptedResult(result);
      
      toast({
        title: "Encryption successful",
        description: "Your text has been encrypted"
      });
    } catch (error) {
      toast({
        title: "Encryption failed",
        description: "An error occurred during encryption",
        variant: "destructive"
      });
    } finally {
      setIsEncrypting(false);
    }
  };
  
  const handleDecrypt = async () => {
    if (!encryptedResult) {
      toast({
        title: "No data to decrypt",
        description: "Please encrypt something first or enter encrypted text",
        variant: "destructive"
      });
      return;
    }
    
    if (!encryptionKey) {
      toast({
        title: "Key required",
        description: "Please enter the decryption key",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsDecrypting(true);
      
      const decrypted = await decryptText({
        encrypted: encryptedResult.encrypted,
        iv: encryptedResult.iv,
        tag: encryptedResult.tag,
        key: encryptionKey,
        algorithm: encryptionMethod
      });
      
      setTextToEncrypt(decrypted);
      setEncryptedResult(null);
      
      toast({
        title: "Decryption successful",
        description: "Your text has been decrypted"
      });
    } catch (error) {
      toast({
        title: "Decryption failed",
        description: "Invalid key or corrupted data",
        variant: "destructive"
      });
    } finally {
      setIsDecrypting(false);
    }
  };
  
  const handleHash = async () => {
    if (!textToHash) {
      toast({
        title: "Input required",
        description: "Please enter text to hash",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsHashing(true);
      const result = await hashText(textToHash, hashAlgorithm);
      setHashResult(result.hash);
      
      toast({
        title: "Hashing successful",
        description: `${hashAlgorithm.toUpperCase()} hash generated`
      });
    } catch (error) {
      toast({
        title: "Hashing failed",
        description: "An error occurred during hashing",
        variant: "destructive"
      });
    } finally {
      setIsHashing(false);
    }
  };
  
  const handleCopyHash = async () => {
    if (!hashResult) return;
    
    if (await copyToClipboard(hashResult)) {
      toast({
        title: "Hash copied",
        description: "Hash has been copied to clipboard"
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Failed to copy hash to clipboard",
        variant: "destructive"
      });
    }
  };
  
  const handleCopyEncrypted = async () => {
    if (!encryptedResult) return;
    
    const textToCopy = encryptionMethod === 'aes'
      ? JSON.stringify(encryptedResult)
      : encryptedResult.encrypted;
    
    if (await copyToClipboard(textToCopy)) {
      toast({
        title: "Encrypted data copied",
        description: "Encrypted data has been copied to clipboard"
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Failed to copy encrypted data to clipboard",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="glass-card rounded-2xl p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <Lock className="h-6 w-6 text-purple-primary mr-2" />
          Cryptographic Tools
        </h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Encrypt/Decrypt Section */}
        <div className="flex-1">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Text Encryption/Decryption</h3>
            
            <div className="mb-3">
              <Label className="block text-sm font-medium mb-1">Encryption Method</Label>
              <Select 
                value={encryptionMethod} 
                onValueChange={(value: 'aes' | 'fernet' | 'tripledes' | 'blowfish') => setEncryptionMethod(value)}
              >
                <SelectTrigger className="w-full bg-white border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade">
                  <SelectValue placeholder="Select encryption method" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-800">
                  <SelectItem value="aes">AES-256 (Recommended)</SelectItem>
                  <SelectItem value="fernet">Fernet (Implementation of AES-128-CBC)</SelectItem>
                  <SelectItem value="tripledes">Triple DES (Legacy)</SelectItem>
                  <SelectItem value="blowfish">Blowfish (Legacy)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-3">
              <Label className="block text-sm font-medium mb-1">Encryption Key</Label>
              <div className="relative">
                <Input
                  type={showEncryptionKey ? "text" : "password"}
                  placeholder="Enter encryption key..."
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 pr-10 focus:outline-none focus:border-purple-primary transition-fade"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-gray-400 hover:text-white transition-fade"
                  onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                >
                  {showEncryptionKey ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <Label className="block text-sm font-medium mb-1">Text Input</Label>
              <Textarea
                placeholder="Enter text to encrypt or decrypt..."
                rows={5}
                value={textToEncrypt}
                onChange={(e) => setTextToEncrypt(e.target.value)}
                className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade"
              />
            </div>
            
            {encryptedResult && (
              <div className="mb-3">
                <Label className="block text-sm font-medium mb-1">Encrypted Result</Label>
                <div className="relative">
                  <Textarea
                    value={
                      encryptionMethod === 'aes'
                        ? JSON.stringify(encryptedResult, null, 2)
                        : encryptedResult.encrypted
                    }
                    rows={5}
                    readOnly
                    className="w-full font-mono text-sm bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none transition-fade"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-fade"
                    onClick={handleCopyEncrypted}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button
                type="button"
                className="flex-1 bg-purple-primary hover:bg-purple-accent text-white py-2 rounded-full font-medium transition-fade glow-effect"
                onClick={handleEncrypt}
                disabled={isEncrypting}
              >
                {isEncrypting ? 'Encrypting...' : 'Encrypt'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent border border-purple-primary text-purple-primary hover:bg-purple-primary/10 py-2 rounded-full font-medium transition-fade"
                onClick={handleDecrypt}
                disabled={isDecrypting || !encryptedResult}
              >
                {isDecrypting ? 'Decrypting...' : 'Decrypt'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Hashing Section */}
        <div className="flex-1">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Hashing Tools</h3>
            
            <div className="mb-3">
              <Label className="block text-sm font-medium mb-1">Hashing Algorithm</Label>
              <Select 
                value={hashAlgorithm} 
                onValueChange={(value: 'sha256' | 'sha512' | 'md5' | 'blake2b' | 'ripemd160') => setHashAlgorithm(value)}
              >
                <SelectTrigger className="w-full bg-white border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade">
                  <SelectValue placeholder="Select hashing algorithm" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-800">
                  <SelectItem value="sha256">SHA-256 (Recommended)</SelectItem>
                  <SelectItem value="sha512">SHA-512 (Strong)</SelectItem>
                  <SelectItem value="blake2b">BLAKE2b (Fast & Secure)</SelectItem>
                  <SelectItem value="ripemd160">RIPEMD-160 (Bitcoin)</SelectItem>
                  <SelectItem value="md5">MD5 (Not secure, legacy only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-3">
              <Label className="block text-sm font-medium mb-1">Text Input</Label>
              <Textarea
                placeholder="Enter text to hash..."
                rows={5}
                value={textToHash}
                onChange={(e) => setTextToHash(e.target.value)}
                className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade"
              />
            </div>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium mb-1">Hash Output</Label>
              <div className="relative">
                <Input
                  type="text"
                  readOnly
                  value={hashResult}
                  className="w-full font-mono text-sm bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 pr-10 focus:outline-none transition-fade"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-gray-400 hover:text-white transition-fade"
                  title="Copy Hash"
                  onClick={handleCopyHash}
                  disabled={!hashResult}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                </button>
              </div>
            </div>
            
            <Button
              type="button"
              className="w-full bg-purple-primary hover:bg-purple-accent text-white py-2 rounded-full font-medium transition-fade glow-effect"
              onClick={handleHash}
              disabled={isHashing}
            >
              {isHashing ? 'Generating...' : 'Generate Hash'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
