import React, { useState } from 'react';
import { useData } from '@/lib/dataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Upload, Save, User, Mail, Lock } from 'lucide-react';

export default function AccountSettings() {
  const { toast } = useToast();
  const { currentUser } = useData();
  
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    name: 'John Doe', // Mock data
    avatarUrl: '',
  });
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Profile updated",
        description: "Your account settings have been updated successfully",
      });
    }, 500);
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
      setIsPasswordModalOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }, 500);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Account Information</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.avatarUrl} alt={formData.name} />
                <AvatarFallback className="bg-purple-500/30 text-white text-xl">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                className="border-purple-500 text-purple-500 hover:bg-purple-500/10"
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Avatar
              </Button>
            </div>
            
            <div className="md:w-2/3 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-purple-800/50 border border-purple-500/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="bg-purple-800/50 border border-purple-500/30"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-purple-800/50 border border-purple-500/30"
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit"
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <div className="pt-6 border-t border-purple-500/20">
        <h3 className="text-lg font-medium mb-4">Password</h3>
        
        <div className="bg-purple-500/10 p-4 rounded-lg mb-4">
          <h4 className="font-medium flex items-center">
            <Lock className="h-4 w-4 mr-2 text-purple-500" />
            Change Master Password
          </h4>
          <p className="text-sm text-gray-300 mt-1 mb-3">
            Your master password is used to encrypt your vault. Make sure it's strong and unique.
          </p>
          
          <Button 
            variant="outline" 
            className="border-purple-500 text-purple-500 hover:bg-purple-500/10"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            Change Password
          </Button>
        </div>
        
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-card rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Change Master Password</h3>
                <button className="text-gray-400 hover:text-white" onClick={() => setIsPasswordModalOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="bg-purple-800/50 border border-purple-500/30 mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="bg-purple-800/50 border border-purple-500/30 mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="bg-purple-800/50 border border-purple-500/30 mt-1"
                    required
                  />
                </div>
                
                <div className="bg-purple-500/10 p-3 rounded-lg text-sm text-yellow-300 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <span>
                    Warning: If you forget your master password, we cannot recover your data.
                    There is no password reset option.
                  </span>
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
                    onClick={() => setIsPasswordModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      
      <div className="pt-6 border-t border-purple-500/20">
        <h3 className="text-lg font-medium mb-4 text-danger">Danger Zone</h3>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <h4 className="font-medium">Delete Account</h4>
            <p className="text-sm text-gray-300">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div>
              <Button 
                variant="destructive" 
                className="mt-2"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
                    toast({
                      title: "Account deletion initiated",
                      description: "We've sent a confirmation email to verify your request.",
                    });
                  }
                }}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
