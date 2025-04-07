import React, { useState } from 'react';
import { useData } from '@/lib/dataContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldCheck, QrCode, Mail, Clock, RefreshCw } from 'lucide-react';

export default function SecuritySettings() {
  const { toast } = useToast();
  const { currentUser } = useData();
  
  const [twoFactor, setTwoFactor] = useState({
    enabled: currentUser?.twoFactorEnabled || false,
    method: 'authenticator',
    setupStep: 0,
    verificationCode: '',
    backupCodesVisible: false,
  });
  
  const [passwordRotation, setPasswordRotation] = useState({
    enabled: true,
    days: '90',
    notifyBeforeDays: '7',
  });
  
  const [passwordSettings, setPasswordSettings] = useState({
    minimumLength: '12',
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    disallowReuse: true,
    recentPasswordsToCheck: '5',
  });
  
  const handleTwoFactorChange = (key: string, value: any) => {
    setTwoFactor(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handlePasswordRotationChange = (key: string, value: any) => {
    setPasswordRotation(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handlePasswordSettingChange = (key: string, value: any) => {
    setPasswordSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const setupTwoFactor = () => {
    if (twoFactor.setupStep === 0) {
      setTwoFactor(prev => ({
        ...prev,
        setupStep: 1
      }));
    } else if (twoFactor.setupStep === 1) {
      // Verify code
      if (twoFactor.verificationCode === '123456') { // Mock verification
        setTwoFactor(prev => ({
          ...prev,
          setupStep: 2,
          enabled: true
        }));
        
        toast({
          title: "Two-factor authentication enabled",
          description: "Your account is now more secure!",
        });
      } else {
        toast({
          title: "Invalid verification code",
          description: "Please try again with the correct code",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Two-Factor Authentication (2FA)</h3>
        
        <div className="bg-purple-500/10 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <ShieldCheck className="h-5 w-5 text-purple-500 mr-2" />
              <h4 className="font-medium">Two-Factor Authentication</h4>
            </div>
            <Switch
              checked={twoFactor.enabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  setTwoFactor(prev => ({
                    ...prev,
                    setupStep: 1
                  }));
                } else {
                  setTwoFactor(prev => ({
                    ...prev,
                    enabled: false,
                    setupStep: 0
                  }));
                  toast({
                    title: "Two-factor authentication disabled",
                    description: "Your account is now less secure.",
                  });
                }
              }}
            />
          </div>
          <p className="text-sm text-gray-300 mb-3">
            Add an extra layer of security to your account by requiring a verification code in addition to your password.
          </p>
          
          {!twoFactor.enabled && twoFactor.setupStep === 0 && (
            <Button 
              variant="outline" 
              className="border-purple-500 text-purple-500 hover:bg-purple-500/10"
              onClick={setupTwoFactor}
            >
              Set Up Two-Factor Authentication
            </Button>
          )}
          
          {twoFactor.setupStep === 1 && (
            <div className="space-y-4 mt-4">
              <h5 className="font-medium">Choose Authentication Method</h5>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="authenticator" 
                    name="2fa-method" 
                    value="authenticator"
                    checked={twoFactor.method === 'authenticator'}
                    onChange={() => handleTwoFactorChange('method', 'authenticator')}
                    className="accent-purple-primary" 
                  />
                  <Label htmlFor="authenticator" className="flex items-center cursor-pointer">
                    <QrCode className="h-4 w-4 mr-2" />
                    Authenticator App (Google Authenticator, Authy)
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="email" 
                    name="2fa-method" 
                    value="email"
                    checked={twoFactor.method === 'email'}
                    onChange={() => handleTwoFactorChange('method', 'email')}
                    className="accent-purple-primary" 
                  />
                  <Label htmlFor="email" className="flex items-center cursor-pointer">
                    <Mail className="h-4 w-4 mr-2" />
                    Email (Receive codes via email)
                  </Label>
                </div>
              </div>
              
              {twoFactor.method === 'authenticator' && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg w-48 h-48 mx-auto relative">
                    {/* Mock QR Code */}
                    <div className="absolute inset-4 grid grid-cols-7 grid-rows-7 gap-1">
                      {Array.from({ length: 49 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`bg-black ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  <ol className="list-decimal list-inside text-sm text-gray-300 space-y-2">
                    <li>Install an authenticator app if you don't have one</li>
                    <li>Scan the QR code with your authenticator app</li>
                    <li>Enter the 6-digit verification code below</li>
                  </ol>
                </div>
              )}
              
              {twoFactor.method === 'email' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-300">
                    We'll send a verification code to your email address ({currentUser?.email || 'john@example.com'}) when you log in.
                  </p>
                  <Button
                    variant="outline" 
                    className="border-purple-500 text-purple-500 hover:bg-purple-500/10"
                    onClick={() => {
                      toast({
                        title: "Verification code sent",
                        description: "Check your email for the verification code",
                      });
                    }}
                  >
                    Send Test Code
                  </Button>
                </div>
              )}
              
              <div className="pt-2">
                <Label htmlFor="verification-code">Enter Verification Code</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="verification-code"
                    value={twoFactor.verificationCode}
                    onChange={(e) => handleTwoFactorChange('verificationCode', e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="bg-purple-800/50 border border-purple-500/30"
                  />
                  <Button
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    onClick={setupTwoFactor}
                  >
                    Verify
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {twoFactor.setupStep === 2 && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center space-x-2 text-success">
                <ShieldCheck className="h-5 w-5" />
                <span>Two-factor authentication is enabled</span>
              </div>
              
              <div>
                <Button
                  variant="outline" 
                  className="border-purple-500 text-purple-500 hover:bg-purple-500/10"
                  onClick={() => handleTwoFactorChange('backupCodesVisible', !twoFactor.backupCodesVisible)}
                >
                  {twoFactor.backupCodesVisible ? 'Hide Backup Codes' : 'Show Backup Codes'}
                </Button>
              </div>
              
              {twoFactor.backupCodesVisible && (
                <div className="bg-purple-800/50 p-3 rounded-lg border border-purple-500/30">
                  <p className="text-sm text-gray-300 mb-2">
                    Save these backup codes in a secure place. You can use them to sign in if you lose access to your authentication device.
                  </p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    <div className="bg-purple-800 p-2 rounded">1234-5678</div>
                    <div className="bg-purple-800 p-2 rounded">8765-4321</div>
                    <div className="bg-purple-800 p-2 rounded">9876-5432</div>
                    <div className="bg-purple-800 p-2 rounded">2345-6789</div>
                    <div className="bg-purple-800 p-2 rounded">3456-7890</div>
                    <div className="bg-purple-800 p-2 rounded">4567-8901</div>
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <Button
                  variant="outline" 
                  className="border-purple-500 text-purple-500 hover:bg-purple-500/10"
                  onClick={() => {
                    setTwoFactor(prev => ({
                      ...prev,
                      enabled: false,
                      setupStep: 0,
                      verificationCode: '',
                      backupCodesVisible: false,
                    }));
                    toast({
                      title: "Two-factor authentication disabled",
                      description: "Your account is now less secure.",
                    });
                  }}
                >
                  Disable Two-Factor Authentication
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Password Rotation</h3>
        
        <div className="bg-purple-500/10 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <RefreshCw className="h-5 w-5 text-purple-500 mr-2" />
              <h4 className="font-medium">Password Rotation Policy</h4>
            </div>
            <Switch
              checked={passwordRotation.enabled}
              onCheckedChange={(checked) => handlePasswordRotationChange('enabled', checked)}
            />
          </div>
          <p className="text-sm text-gray-300 mb-3">
            Automatically remind you to update passwords after a specified period to enhance security.
          </p>
          
          {passwordRotation.enabled && (
            <div className="space-y-4 mt-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="rotation-days" className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Rotate Passwords Every
                </Label>
                <Select
                  value={passwordRotation.days}
                  onValueChange={(value) => handlePasswordRotationChange('days', value)}
                >
                  <SelectTrigger id="rotation-days" className="w-[180px] bg-purple-800/50 border border-purple-500/30">
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">365 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="notify-days" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Notify Before Expiry
                </Label>
                <Select
                  value={passwordRotation.notifyBeforeDays}
                  onValueChange={(value) => handlePasswordRotationChange('notifyBeforeDays', value)}
                >
                  <SelectTrigger id="notify-days" className="w-[180px] bg-purple-800/50 border border-purple-500/30">
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days before</SelectItem>
                    <SelectItem value="7">7 days before</SelectItem>
                    <SelectItem value="14">14 days before</SelectItem>
                    <SelectItem value="30">30 days before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Password Policy</h3>
        
        <div className="bg-purple-500/10 p-4 rounded-lg mb-4">
          <div className="flex items-center mb-3">
            <Shield className="h-5 w-5 text-purple-500 mr-2" />
            <h4 className="font-medium">Password Requirements</h4>
          </div>
          
          <div className="space-y-4 mt-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="min-length">Minimum Password Length</Label>
              <Select
                value={passwordSettings.minimumLength}
                onValueChange={(value) => handlePasswordSettingChange('minimumLength', value)}
              >
                <SelectTrigger id="min-length" className="w-[180px] bg-purple-800/50 border border-purple-500/30">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 characters</SelectItem>
                  <SelectItem value="10">10 characters</SelectItem>
                  <SelectItem value="12">12 characters</SelectItem>
                  <SelectItem value="16">16 characters</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="require-uppercase">Require Uppercase Letters</Label>
                <Switch
                  id="require-uppercase"
                  checked={passwordSettings.requireUppercase}
                  onCheckedChange={(checked) => handlePasswordSettingChange('requireUppercase', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="require-lowercase">Require Lowercase Letters</Label>
                <Switch
                  id="require-lowercase"
                  checked={passwordSettings.requireLowercase}
                  onCheckedChange={(checked) => handlePasswordSettingChange('requireLowercase', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="require-numbers">Require Numbers</Label>
                <Switch
                  id="require-numbers"
                  checked={passwordSettings.requireNumbers}
                  onCheckedChange={(checked) => handlePasswordSettingChange('requireNumbers', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="require-symbols">Require Special Characters</Label>
                <Switch
                  id="require-symbols"
                  checked={passwordSettings.requireSymbols}
                  onCheckedChange={(checked) => handlePasswordSettingChange('requireSymbols', checked)}
                />
              </div>
            </div>
            
            <div className="pt-2 border-t border-purple-500/20">
              <div className="flex items-center justify-between mt-2">
                <div>
                  <Label htmlFor="disallow-reuse" className="mb-1 block">Disallow Password Reuse</Label>
                  <p className="text-xs text-gray-400">Prevent reusing recent passwords</p>
                </div>
                <Switch
                  id="disallow-reuse"
                  checked={passwordSettings.disallowReuse}
                  onCheckedChange={(checked) => handlePasswordSettingChange('disallowReuse', checked)}
                />
              </div>
              
              {passwordSettings.disallowReuse && (
                <div className="flex flex-col space-y-1.5 mt-3 ml-6">
                  <Label htmlFor="recent-passwords">Check Against Recent Passwords</Label>
                  <Select
                    value={passwordSettings.recentPasswordsToCheck}
                    onValueChange={(value) => handlePasswordSettingChange('recentPasswordsToCheck', value)}
                  >
                    <SelectTrigger id="recent-passwords" className="w-[180px] bg-purple-800/50 border border-purple-500/30">
                      <SelectValue placeholder="Select count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Last 3 passwords</SelectItem>
                      <SelectItem value="5">Last 5 passwords</SelectItem>
                      <SelectItem value="10">Last 10 passwords</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button 
          className="bg-purple-500 hover:bg-purple-600 text-white"
          onClick={() => {
            toast({
              title: "Security settings saved",
              description: "Your security preferences have been updated",
            });
          }}
        >
          Save Security Settings
        </Button>
      </div>
    </div>
  );
}
