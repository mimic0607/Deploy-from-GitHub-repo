import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Wand2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/lib/dataContext';
import { generatePassword } from '@/lib/passwordUtils';
import { VaultCategories } from '@/types';
import type { VaultItem } from '@/types';

interface AddCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem: VaultItem | null;
}

export default function AddCredentialModal({ isOpen, onClose, editItem }: AddCredentialModalProps) {
  const { toast } = useToast();
  const { addVaultItem, updateVaultItem } = useData();
  
  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 90); // 90 days from now
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    username: '',
    password: '',
    category: 'Social',
    notes: '',
    setPasswordExpiry: false,
    expiryDate: defaultExpiry.toISOString().split('T')[0]
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when the modal opens or editItem changes
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setFormData({
          name: editItem.name || '',
          url: editItem.url || '',
          username: editItem.username || '',
          password: editItem.password || '',
          category: editItem.category || 'Other',
          notes: editItem.notes || '',
          setPasswordExpiry: !!editItem.expiryDate,
          expiryDate: editItem.expiryDate 
            ? new Date(editItem.expiryDate).toISOString().split('T')[0]
            : defaultExpiry.toISOString().split('T')[0]
        });
      } else {
        // Reset form for a new credential
        setFormData({
          name: '',
          url: '',
          username: '',
          password: '',
          category: 'Social',
          notes: '',
          setPasswordExpiry: false,
          expiryDate: defaultExpiry.toISOString().split('T')[0]
        });
      }
      
      setShowPassword(false);
    }
  }, [isOpen, editItem]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, setPasswordExpiry: checked }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };
  
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleGeneratePassword = async () => {
    try {
      setIsGeneratingPassword(true);
      const result = await generatePassword({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeAmbiguous: false
      });
      
      setFormData(prev => ({ ...prev, password: result.password }));
      toast({
        title: "Password generated",
        description: `Generated a strong password with ${result.entropy} bits of entropy`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate password",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPassword(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.username || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const credentialData = {
      userId: 1, // Mock user ID
      name: formData.name,
      url: formData.url,
      username: formData.username,
      password: formData.password,
      category: formData.category,
      notes: formData.notes,
      expiryDate: formData.setPasswordExpiry ? formData.expiryDate : undefined,
      lastUsed: new Date().toISOString()
    };
    
    try {
      setIsSubmitting(true);
      
      if (editItem) {
        // Update existing credential
        await updateVaultItem(editItem.id, credentialData);
        toast({
          title: "Credential updated",
          description: "Your credential has been updated successfully"
        });
      } else {
        // Add new credential
        await addVaultItem(credentialData);
        toast({
          title: "Credential added",
          description: "Your credential has been added to the vault"
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save credential. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editItem ? 'Edit Credential' : 'Add New Credential'}
          </DialogTitle>
          <button 
            className="absolute right-4 top-4 text-gray-400 hover:text-white transition-fade"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium mb-1">Website or Service</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Google, Netflix, Bank of America"
              className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="url" className="block text-sm font-medium mb-1">URL (Optional)</Label>
            <Input
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade"
            />
          </div>
          
          <div>
            <Label htmlFor="username" className="block text-sm font-medium mb-1">Username / Email</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="block text-sm font-medium mb-1">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 pr-20 focus:outline-none focus:border-purple-primary transition-fade"
                required
              />
              <div className="absolute right-3 top-2 flex space-x-2">
                <button 
                  type="button"
                  className="text-gray-400 hover:text-white transition-fade" 
                  title="Toggle Visibility"
                  onClick={handleTogglePassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button 
                  type="button"
                  className="text-gray-400 hover:text-white transition-fade" 
                  title="Generate Password"
                  onClick={handleGeneratePassword}
                  disabled={isGeneratingPassword}
                >
                  <Wand2 className={`h-4 w-4 ${isGeneratingPassword ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="category" className="block text-sm font-medium mb-1">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full bg-white text-gray-800 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-800">
                {VaultCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="notes" className="block text-sm font-medium mb-1">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional information"
              rows={3}
              className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade"
            />
          </div>
          
          <div className="flex items-center mt-2">
            <Checkbox 
              id="password-expiry" 
              checked={formData.setPasswordExpiry}
              onCheckedChange={handleCheckboxChange}
              className="rounded text-purple-primary focus:ring-purple-primary focus:ring-offset-purple-dark" 
            />
            <Label 
              htmlFor="password-expiry" 
              className="ml-2 text-sm"
            >
              Set password expiry reminder
            </Label>
          </div>
          
          {formData.setPasswordExpiry && (
            <div>
              <Label htmlFor="expiryDate" className="block text-sm font-medium mb-1">Expiry Date</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full bg-purple-dark/50 border border-purple-primary/30 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-primary transition-fade"
              />
            </div>
          )}
          
          <div className="flex space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent border border-purple-primary text-purple-primary hover:bg-purple-primary/10 py-2 rounded-full font-medium transition-fade"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-primary hover:bg-purple-accent text-white py-2 rounded-full font-medium transition-fade glow-effect"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editItem ? 'Update Credential' : 'Save Credential')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
