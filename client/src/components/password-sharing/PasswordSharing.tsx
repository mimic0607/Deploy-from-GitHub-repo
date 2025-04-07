import React, { useState } from 'react';
import { Share2, Clock, Key, Mail, Copy, Check, X, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/lib/dataContext';
import { encryptText } from '@/lib/crypto';
import { copyToClipboard, formatDateRelative } from '@/lib/utils';
import type { VaultItem, NewPasswordShare } from '@/types';

export default function PasswordSharing() {
  const { toast } = useToast();
  const { vaultItems, sharedPasswords, sharePassword } = useData();
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedVaultItem, setSelectedVaultItem] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryHours, setExpiryHours] = useState('24');
  const [accessCode, setAccessCode] = useState('');
  const [useAccessCode, setUseAccessCode] = useState(false);
  const [generateRandomCode, setGenerateRandomCode] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareData, setShareData] = useState<{
    link: string;
    accessCode?: string;
  } | null>(null);
  
  const handleOpenShareModal = () => {
    setIsShareModalOpen(true);
    setSelectedVaultItem('');
    setRecipientEmail('');
    setHasExpiry(true);
    setExpiryHours('24');
    setAccessCode('');
    setUseAccessCode(true);
    setGenerateRandomCode(true);
    setShareSuccess(false);
    setShareData(null);
  };
  
  const handleGenerateAccessCode = () => {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setAccessCode(code);
  };
  
  const handleShare = async () => {
    if (!selectedVaultItem) {
      toast({
        title: "Selection required",
        description: "Please select a credential to share",
        variant: "destructive"
      });
      return;
    }
    
    if (!recipientEmail) {
      toast({
        title: "Recipient required",
        description: "Please enter a recipient email",
        variant: "destructive"
      });
      return;
    }
    
    if (useAccessCode && generateRandomCode) {
      handleGenerateAccessCode();
    }
    
    const selectedItem = vaultItems.find(item => item.id.toString() === selectedVaultItem);
    if (!selectedItem) return;
    
    // Prepare data for sharing
    const dataToShare = {
      name: selectedItem.name,
      username: selectedItem.username,
      password: selectedItem.password,
      url: selectedItem.url,
      notes: selectedItem.notes,
      sharedBy: 'johndoe' // Mock username
    };
    
    try {
      setIsSharing(true);
      
      // Encrypt the data to share
      let securityKey = accessCode;
      if (!useAccessCode) {
        // Generate a secure key if not using access code
        securityKey = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
      }
      
      const encrypted = await encryptText(
        JSON.stringify(dataToShare),
        securityKey,
        'aes'
      );
      
      // Calculate expiry date if needed
      let expiryDate: Date | undefined;
      if (hasExpiry) {
        expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + parseInt(expiryHours));
      }
      
      // Create share data
      const shareData: NewPasswordShare = {
        senderId: 1, // Mock user ID
        vaultItemId: selectedItem.id,
        recipientEmail,
        encryptedData: JSON.stringify(encrypted),
        expiresAt: expiryDate?.toISOString(),
        accessCode: useAccessCode ? accessCode : undefined
      };
      
      // Save to the database
      const result = await sharePassword(shareData);
      
      // Generate a sharing link (in a real app, this would be a proper URL)
      const shareLink = `https://securepass.example.com/shared/${result.id}`;
      
      // Set success state and data
      setShareSuccess(true);
      setShareData({
        link: shareLink,
        accessCode: useAccessCode ? accessCode : undefined
      });
      
      toast({
        title: "Credential shared",
        description: "Credential has been shared successfully",
      });
    } catch (error) {
      toast({
        title: "Sharing failed",
        description: "Failed to share credential. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleCopy = async (text: string, type: 'link' | 'code') => {
    if (await copyToClipboard(text)) {
      toast({
        title: `${type === 'link' ? 'Link' : 'Access code'} copied`,
        description: `The ${type === 'link' ? 'sharing link' : 'access code'} has been copied to clipboard`,
      });
    } else {
      toast({
        title: "Copy failed",
        description: `Failed to copy the ${type === 'link' ? 'sharing link' : 'access code'}`,
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteShare = async (id: number) => {
    // This would be implemented in a real app
    toast({
      title: "Share revoked",
      description: "The shared credential has been revoked",
    });
  };
  
  return (
    <>
      <div className="glass-card rounded-2xl p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Share2 className="h-6 w-6 text-purple-primary mr-2" />
            Password Sharing
          </h2>
          <Button
            className="bg-purple-primary text-white px-4 py-2 rounded-full flex items-center glow-effect hover:bg-purple-accent transition-fade"
            onClick={handleOpenShareModal}
          >
            <Share2 className="h-4 w-4 mr-2" />
            <span>Share Password</span>
          </Button>
        </div>
        
        {/* Active Shares */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Active Shares</h3>
          
          {sharedPasswords.length === 0 ? (
            <div className="text-center py-10 bg-purple-primary/5 rounded-xl">
              <Share2 className="h-12 w-12 mx-auto text-purple-primary/40 mb-3" />
              <p className="text-gray-400">You haven't shared any passwords yet.</p>
              <Button 
                variant="link" 
                className="text-purple-primary mt-2"
                onClick={handleOpenShareModal}
              >
                Share your first password
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sharedPasswords.map((share) => {
                const vaultItem = vaultItems.find(item => item.id === share.vaultItemId);
                if (!vaultItem) return null;
                
                const isExpired = share.expiresAt && new Date(share.expiresAt) < new Date();
                
                return (
                  <div 
                    key={share.id} 
                    className={`glass-card rounded-xl p-4 ${isExpired ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-dark flex items-center justify-center text-purple-primary border border-purple-primary/30">
                          <Share2 className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <h4 className="font-medium">{vaultItem.name}</h4>
                          <p className="text-sm text-gray-400">
                            Shared with: {share.recipientEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {isExpired ? (
                          <span className="text-xs bg-danger/20 text-danger px-2 py-1 rounded-full">
                            Expired
                          </span>
                        ) : share.expiresAt ? (
                          <div className="flex items-center mr-4">
                            <Clock className="h-4 w-4 text-warning mr-1" />
                            <span className="text-xs text-warning">
                              Expires {formatDateRelative(share.expiresAt)}
                            </span>
                          </div>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger hover:text-danger hover:bg-danger/10"
                          onClick={() => handleDeleteShare(share.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Information Section */}
        <div className="bg-purple-primary/10 p-5 rounded-xl">
          <h3 className="text-lg font-semibold mb-3">Secure Password Sharing</h3>
          <p className="text-sm text-gray-300 mb-3">
            Our password sharing feature uses end-to-end encryption to ensure your credentials remain secure.
          </p>
          <ul className="text-sm space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="h-5 w-5 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-2 mt-0.5">1</span>
              <span>Choose a credential and recipient email</span>
            </li>
            <li className="flex items-start">
              <span className="h-5 w-5 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-2 mt-0.5">2</span>
              <span>Set an expiration time for time-limited access</span>
            </li>
            <li className="flex items-start">
              <span className="h-5 w-5 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-2 mt-0.5">3</span>
              <span>Use an access code for an additional layer of security</span>
            </li>
            <li className="flex items-start">
              <span className="h-5 w-5 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mr-2 mt-0.5">4</span>
              <span>Share the link and access code separately for maximum security</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="glass-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Share Password Securely
            </DialogTitle>
          </DialogHeader>
          
          {!shareSuccess ? (
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-1">Select Credential</Label>
                <Select value={selectedVaultItem} onValueChange={setSelectedVaultItem}>
                  <SelectTrigger className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade">
                    <SelectValue placeholder="Choose a credential to share" />
                  </SelectTrigger>
                  <SelectContent>
                    {vaultItems.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name} ({item.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium mb-1">Recipient Email</Label>
                <Input
                  type="email"
                  placeholder="recipient@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade"
                />
              </div>
              
              <div className="flex items-center">
                <Checkbox 
                  id="has-expiry" 
                  checked={hasExpiry} 
                  onCheckedChange={(checked) => setHasExpiry(!!checked)}
                />
                <Label htmlFor="has-expiry" className="ml-2 text-sm">
                  Set expiration time
                </Label>
              </div>
              
              {hasExpiry && (
                <div>
                  <Label className="block text-sm font-medium mb-1">Expires After</Label>
                  <Select value={expiryHours} onValueChange={setExpiryHours}>
                    <SelectTrigger className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade">
                      <SelectValue placeholder="Select expiration time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="72">3 days</SelectItem>
                      <SelectItem value="168">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex items-center">
                <Checkbox 
                  id="use-access-code" 
                  checked={useAccessCode} 
                  onCheckedChange={(checked) => setUseAccessCode(!!checked)}
                />
                <Label htmlFor="use-access-code" className="ml-2 text-sm">
                  Require access code
                </Label>
              </div>
              
              {useAccessCode && (
                <div>
                  <Label className="block text-sm font-medium mb-1">Access Code</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="6-digit code"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      disabled={generateRandomCode}
                      className="flex-1 bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade"
                    />
                    <Button
                      variant="outline"
                      className="border-purple-primary text-purple-primary hover:bg-purple-primary/10"
                      onClick={handleGenerateAccessCode}
                    >
                      Generate
                    </Button>
                  </div>
                  <div className="flex items-center mt-2">
                    <Checkbox 
                      id="auto-generate" 
                      checked={generateRandomCode} 
                      onCheckedChange={(checked) => setGenerateRandomCode(!!checked)}
                    />
                    <Label htmlFor="auto-generate" className="ml-2 text-xs text-gray-400">
                      Generate random code automatically
                    </Label>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-purple-primary text-purple-primary hover:bg-purple-primary/10"
                  onClick={() => setIsShareModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-primary hover:bg-purple-accent text-white"
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  {isSharing ? 'Sharing...' : 'Share Securely'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="h-16 w-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold">Password Shared Successfully!</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Share the following details with the recipient
                </p>
              </div>
              
              {shareData && (
                <>
                  <div>
                    <Label className="block text-sm font-medium mb-1">Sharing Link</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={shareData.link}
                        readOnly
                        className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 pr-10 pl-3 focus:outline-none"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2 text-gray-400 hover:text-white transition-fade"
                        onClick={() => handleCopy(shareData.link, 'link')}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Send this link to the recipient
                    </p>
                  </div>
                  
                  {shareData.accessCode && (
                    <div>
                      <Label className="block text-sm font-medium mb-1">Access Code</Label>
                      <div className="relative">
                        <Input
                          type="text"
                          value={shareData.accessCode}
                          readOnly
                          className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 pr-10 pl-3 focus:outline-none"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2 text-gray-400 hover:text-white transition-fade"
                          onClick={() => handleCopy(shareData.accessCode, 'code')}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-purple-primary mt-1 flex items-center">
                        <Key className="h-3 w-3 mr-1" />
                        Share this code separately for better security
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-purple-primary/10 p-3 rounded-lg">
                    <p className="text-xs text-gray-300">
                      For maximum security, share the link and access code through different channels 
                      (e.g., email the link and text the access code).
                    </p>
                  </div>
                </>
              )}
              
              <div className="flex space-x-3 mt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-purple-primary text-purple-primary hover:bg-purple-primary/10"
                  onClick={() => setIsShareModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-purple-primary hover:bg-purple-accent text-white"
                  onClick={handleOpenShareModal}
                >
                  Share Another
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
