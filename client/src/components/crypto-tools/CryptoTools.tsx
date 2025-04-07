import React, { useState } from 'react';
import { Lock, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { encryptText, decryptText, hashText, deriveKeyFromPassword } from '@/lib/crypto';
import { copyToClipboard } from '@/lib/utils';
import { EncryptionAlgorithm, HashingAlgorithm, NewVaultItem } from '@/types';
import { useData } from '@/lib/dataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CryptoTools() {
  const { toast } = useToast();
  const { addVaultItem, currentUser } = useData();
  
  // Encryption state
  const [encryptionType, setEncryptionType] = useState<'symmetric' | 'asymmetric'>('symmetric');
  const [encryptionMethod, setEncryptionMethod] = useState<EncryptionAlgorithm>('aes');
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
  const [usePasswordBasedKey, setUsePasswordBasedKey] = useState(true);
  
  // Save to vault dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [vaultItemName, setVaultItemName] = useState('');
  const [vaultItemCategory, setVaultItemCategory] = useState<string>('Crypto');
  const [vaultItemNotes, setVaultItemNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Hashing state
  const [hashAlgorithm, setHashAlgorithm] = useState<HashingAlgorithm>('sha256');
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
      
      // Use the raw key or derive it from password
      const keyToUse = usePasswordBasedKey && encryptionType === 'symmetric' 
        ? deriveKeyFromPassword(encryptionKey) 
        : encryptionKey;
      
      const result = await encryptText(textToEncrypt, keyToUse, encryptionMethod);
      setEncryptedResult(result);
      
      // If using RSA, show the user the public/private key information
      if (encryptionMethod === 'rsa' && result.publicKey && result.tag) {
        toast({
          title: "Encryption successful",
          description: "Your text has been encrypted with RSA. The private key is included in the encrypted result for demonstration purposes."
        });
      } else {
        toast({
          title: "Encryption successful",
          description: usePasswordBasedKey 
            ? "Your text has been encrypted with a key derived from your password" 
            : "Your text has been encrypted"
        });
      }
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
      
      // Use the raw key or derive it from password for symmetric algorithms
      const keyToUse = usePasswordBasedKey && encryptionType === 'symmetric' 
        ? deriveKeyFromPassword(encryptionKey) 
        : encryptionKey;
      
      const decrypted = await decryptText({
        encrypted: encryptedResult.encrypted,
        iv: encryptedResult.iv,
        tag: encryptedResult.tag,
        key: keyToUse,
        algorithm: encryptionMethod
      });
      
      setTextToEncrypt(decrypted);
      setEncryptedResult(null);
      
      toast({
        title: "Decryption successful",
        description: usePasswordBasedKey && encryptionType === 'symmetric'
          ? "Your text has been decrypted with a key derived from your password"
          : "Your text has been decrypted"
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
  
  const handleSaveToVault = () => {
    if (!encryptedResult || !currentUser) return;
    
    // Prepare default values for vault item
    setVaultItemName(`Encrypted with ${encryptionMethod.toUpperCase()}`);
    setVaultItemCategory('Crypto');
    setVaultItemNotes(`Encrypted with ${encryptionMethod.toUpperCase()}. 
${usePasswordBasedKey ? 'Password-based key derivation was used.' : 'Direct encryption key was used.'}
Original text length: ${textToEncrypt.length} characters
Date: ${new Date().toLocaleString()}`);
    
    // Show the save dialog
    setShowSaveDialog(true);
  };
  
  const handleSaveConfirm = async () => {
    if (!encryptedResult || !currentUser) return;
    
    try {
      setIsSaving(true);
      
      const encryptionData = encryptionMethod === 'aes' 
        ? JSON.stringify(encryptedResult)
        : encryptedResult.encrypted;
        
      const vaultItem: NewVaultItem = {
        userId: currentUser.id,
        name: vaultItemName || `Encrypted with ${encryptionMethod.toUpperCase()}`,
        username: `key: ${encryptionKey.substring(0, 8)}...`,
        password: encryptionData,
        category: vaultItemCategory || 'Crypto',
        notes: vaultItemNotes
      };
      
      await addVaultItem(vaultItem);
      
      toast({
        title: "Saved to vault",
        description: "Encrypted data has been saved to your password vault"
      });
      
      // Close the dialog
      setShowSaveDialog(false);
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save encrypted data to vault",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Encrypt/Decrypt Section */}
        <div>
          <div className="mb-4 h-full">
            <h3 className="text-lg font-semibold mb-2">Text Encryption/Decryption</h3>
            
            <div className="mb-3">
              <Label className="block text-sm font-medium mb-1">Encryption Type</Label>
              <Select 
                value={encryptionType} 
                onValueChange={(value: 'symmetric' | 'asymmetric') => {
                  setEncryptionType(value);
                  if (value === 'symmetric') {
                    setEncryptionMethod('aes');
                  } else {
                    setEncryptionMethod('rsa');
                  }
                }}
              >
                <SelectTrigger className="w-full bg-white text-gray-800 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade">
                  <SelectValue placeholder="Select encryption type" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-800">
                  <SelectItem value="symmetric">Symmetric (Same key for encryption/decryption)</SelectItem>
                  <SelectItem value="asymmetric">Asymmetric (Public/private key pair)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-3">
              <Label className="block text-sm font-medium mb-1">Encryption Algorithm</Label>
              <Select 
                value={encryptionMethod} 
                onValueChange={(value: EncryptionAlgorithm) => setEncryptionMethod(value)}
              >
                <SelectTrigger className="w-full bg-white text-gray-800 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade">
                  <SelectValue placeholder="Select encryption algorithm" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-800">
                  {encryptionType === 'symmetric' ? (
                    <>
                      <SelectItem value="aes">AES-256 (Recommended)</SelectItem>
                      <SelectItem value="chacha20">ChaCha20 (Mobile/Low-power devices)</SelectItem>
                      <SelectItem value="twofish">Twofish (Alternative to AES)</SelectItem>
                      <SelectItem value="serpent">Serpent (Highly secure)</SelectItem>
                      <SelectItem value="fernet">Fernet (Implementation of AES-128-CBC)</SelectItem>
                      <SelectItem value="tripledes">Triple DES (Legacy)</SelectItem>
                      <SelectItem value="blowfish">Blowfish (Legacy)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="rsa">RSA (Public/Private Keys)</SelectItem>
                      <SelectItem value="ecc">ECC (Elliptic Curve Cryptography)</SelectItem>
                      <SelectItem value="ed25519">Ed25519 (Modern digital signatures)</SelectItem>
                      <SelectItem value="x25519">X25519 (Fast key exchange)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <Label className="block text-sm font-medium">Encryption Key</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-purple-primary px-2 h-6"
                  onClick={() => {
                    // Generate a random key
                    const randomKey = Array.from(
                      { length: 16 },
                      () => Math.floor(Math.random() * 36).toString(36)
                    ).join('');
                    setEncryptionKey(randomKey);
                    toast({
                      title: "Key generated",
                      description: "A secure random key has been generated"
                    });
                  }}
                >
                  Generate Key
                </Button>
              </div>
              
              <div className="relative">
                <Input
                  type={showEncryptionKey ? "text" : "password"}
                  placeholder={usePasswordBasedKey ? "Enter a memorable password..." : "Enter encryption key..."}
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
              
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="password-based-key"
                  checked={usePasswordBasedKey}
                  onChange={() => setUsePasswordBasedKey(!usePasswordBasedKey)}
                  className="rounded border-purple-primary/50 text-purple-primary focus:ring-purple-primary"
                />
                <label htmlFor="password-based-key" className="text-sm text-gray-300">
                  Use password-based key (easier to remember)
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {usePasswordBasedKey 
                  ? "Your password will be securely transformed into an encryption key" 
                  : "Use a strong random key for maximum security"}
              </p>
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
                    className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 pr-10 focus:outline-none focus:border-purple-primary transition-fade"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2 text-gray-400 hover:text-white transition-fade"
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
                className="flex-1 bg-purple-primary hover:bg-purple-accent text-white py-2 rounded-lg font-medium transition-fade"
                onClick={handleEncrypt}
                disabled={isEncrypting}
              >
                {isEncrypting ? 'Encrypting...' : 'Encrypt'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent border border-purple-primary text-purple-primary hover:bg-purple-primary/10 py-2 rounded-lg font-medium transition-fade"
                onClick={handleDecrypt}
                disabled={isDecrypting || !encryptedResult}
              >
                {isDecrypting ? 'Decrypting...' : 'Decrypt'}
              </Button>
              {encryptedResult && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent border border-purple-primary text-purple-primary hover:bg-purple-primary/10 py-2 rounded-lg font-medium transition-fade"
                  onClick={handleSaveToVault}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save to Vault
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Hashing Section */}
        <div>
          <div className="mb-4 h-full">
            <h3 className="text-lg font-semibold mb-2">Hashing Tools</h3>
            
            <div className="mb-3">
              <Label className="block text-sm font-medium mb-1">Hash Algorithm</Label>
              <Select 
                value={hashAlgorithm} 
                onValueChange={(value: HashingAlgorithm) => setHashAlgorithm(value)}
              >
                <SelectTrigger className="w-full bg-white text-gray-800 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade">
                  <SelectValue placeholder="Select hash algorithm" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-800">
                  <SelectItem value="sha256">SHA-256 (Recommended)</SelectItem>
                  <SelectItem value="sha512">SHA-512 (More secure)</SelectItem>
                  <SelectItem value="md5">MD5 (Legacy, not secure)</SelectItem>
                  <SelectItem value="sha1">SHA-1 (Legacy, not secure)</SelectItem>
                  <SelectItem value="sha3">SHA-3 (Modern standard)</SelectItem>
                  <SelectItem value="blake3">BLAKE3 (Fast and secure)</SelectItem>
                  <SelectItem value="whirlpool">Whirlpool</SelectItem>
                  <SelectItem value="bcrypt">bcrypt (Password hashing)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-3">
              <Label className="block text-sm font-medium mb-1">Text to Hash</Label>
              <Textarea
                placeholder="Enter text to hash..."
                rows={5}
                value={textToHash}
                onChange={(e) => setTextToHash(e.target.value)}
                className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade"
              />
            </div>
            
            {hashResult && (
              <div className="mb-3">
                <Label className="block text-sm font-medium mb-1">Hash Result</Label>
                <div className="relative">
                  <Textarea
                    value={hashResult}
                    rows={5}
                    readOnly
                    className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 pr-10 focus:outline-none focus:border-purple-primary transition-fade"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2 text-gray-400 hover:text-white transition-fade"
                    onClick={handleCopyHash}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
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
      
      {/* Save to Vault Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-purple-dark border border-purple-primary/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Save to Password Vault</DialogTitle>
            <DialogDescription className="text-gray-300">
              Enter details for this encrypted content
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vault-item-name">Name</Label>
              <Input
                id="vault-item-name"
                value={vaultItemName}
                onChange={(e) => setVaultItemName(e.target.value)}
                placeholder="Enter a name for this item"
                className="w-full bg-white text-gray-800 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vault-item-category">Category</Label>
              <Select 
                value={vaultItemCategory} 
                onValueChange={(value) => setVaultItemCategory(value)}
              >
                <SelectTrigger 
                  id="vault-item-category"
                  className="w-full bg-white text-gray-800 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade"
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-800">
                  <SelectItem value="Crypto">Crypto</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vault-item-notes">Notes</Label>
              <Textarea
                id="vault-item-notes"
                value={vaultItemNotes}
                onChange={(e) => setVaultItemNotes(e.target.value)}
                placeholder="Enter additional notes"
                rows={4}
                className="w-full bg-white text-gray-800 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowSaveDialog(false)}
              className="border border-purple-primary/30 text-white hover:bg-purple-primary/10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveConfirm}
              disabled={isSaving}
              className="bg-purple-primary hover:bg-purple-accent text-white"
            >
              {isSaving ? 'Saving...' : 'Save to Vault'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}