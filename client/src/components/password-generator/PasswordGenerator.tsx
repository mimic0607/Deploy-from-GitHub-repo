import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generatePassword } from '@/lib/passwordUtils';
import { copyToClipboard } from '@/lib/utils';
import type { GeneratedPassword, PasswordGeneratorOptions } from '@/types';

export default function PasswordGenerator() {
  const { toast } = useToast();
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
  });
  
  const [password, setPassword] = useState<GeneratedPassword>({
    password: '',
    entropy: 0,
    crackTime: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generate a password on component mount
  useEffect(() => {
    handleGeneratePassword();
  }, []);
  
  const handleGeneratePassword = async () => {
    try {
      setIsGenerating(true);
      const generatedPassword = await generatePassword(options);
      setPassword(generatedPassword);
    } catch (error) {
      toast({
        title: "Error generating password",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopyPassword = async () => {
    if (await copyToClipboard(password.password)) {
      setCopied(true);
      toast({
        title: "Password copied",
        description: "Password has been copied to clipboard",
        duration: 2000
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: "Failed to copy",
        description: "Could not copy password to clipboard",
        variant: "destructive"
      });
    }
  };
  
  const handleOptionChange = (name: keyof PasswordGeneratorOptions, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="text-center mb-4">
        <div className="inline-block rounded-full h-16 w-16 flex items-center justify-center bg-purple-500/20 mb-3">
          <Key className="h-8 w-8 text-purple-500" />
        </div>
        <h2 className="text-xl font-bold">Password Generator</h2>
      </div>
      
      <div className="relative mb-4">
        <input 
          type="text" 
          value={password.password}
          className="w-full bg-purple-800/50 font-mono text-lg text-center border border-purple-500/30 rounded-lg py-3 px-4 focus:outline-none focus:border-purple-500 transition-fade"
          readOnly 
        />
        <button 
          className="absolute right-3 top-3 text-gray-400 hover:text-white transition-fade"
          title="Copy Password"
          onClick={handleCopyPassword}
        >
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <Label className="text-sm font-medium">Password Length</Label>
          <span className="text-sm text-purple-500">{options.length}</span>
        </div>
        <Slider 
          value={[options.length]} 
          min={8} 
          max={32} 
          step={1}
          onValueChange={(value) => handleOptionChange('length', value[0])}
          className="w-full cursor-pointer"
        />
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="includeUppercase">Uppercase Letters (A-Z)</Label>
          <Switch 
            id="includeUppercase" 
            checked={options.includeUppercase}
            onCheckedChange={(value) => handleOptionChange('includeUppercase', value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="includeLowercase">Lowercase Letters (a-z)</Label>
          <Switch 
            id="includeLowercase" 
            checked={options.includeLowercase}
            onCheckedChange={(value) => handleOptionChange('includeLowercase', value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="includeNumbers">Numbers (0-9)</Label>
          <Switch 
            id="includeNumbers" 
            checked={options.includeNumbers}
            onCheckedChange={(value) => handleOptionChange('includeNumbers', value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="includeSymbols">Special Characters (!@#$%^&*)</Label>
          <Switch 
            id="includeSymbols" 
            checked={options.includeSymbols}
            onCheckedChange={(value) => handleOptionChange('includeSymbols', value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="excludeAmbiguous">Exclude Ambiguous Characters (l, I, 1, O, 0)</Label>
          <Switch 
            id="excludeAmbiguous" 
            checked={options.excludeAmbiguous}
            onCheckedChange={(value) => handleOptionChange('excludeAmbiguous', value)}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4 bg-purple-500/10 p-3 rounded-lg">
        <div>
          <span className="block text-sm font-medium">Password Strength</span>
          <div className="flex items-center mt-1">
            <span className="text-success flex items-center">
              <span className="mr-1 h-2 w-2 rounded-full bg-success"></span>
              {password.entropy > 80 ? 'Very Strong' : 
              password.entropy > 60 ? 'Strong' : 
              password.entropy > 40 ? 'Medium' : 'Weak'}
            </span>
          </div>
        </div>
        <div>
          <span className="block text-sm font-medium">Entropy</span>
          <div className="text-purple-500 font-semibold">{password.entropy} bits</div>
        </div>
        <div>
          <span className="block text-sm font-medium">Crack Time</span>
          <div className="text-purple-500 font-semibold">{password.crackTime}</div>
        </div>
      </div>
      
      <Button
        className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 rounded-full font-medium transition-fade glow-effect"
        onClick={handleGeneratePassword}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          'Generate New Password'
        )}
      </Button>
    </div>
  );
}
