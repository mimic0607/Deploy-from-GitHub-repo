import React, { useState } from 'react';
import { useTheme } from '@/components/ui/theme-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Monitor } from 'lucide-react';

export default function AppSettings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [settings, setSettings] = useState({
    autoLogout: true,
    autoLogoutTime: '15',
    clearClipboard: true,
    clearClipboardTime: '30',
    showPasswordStrength: true,
    minimizeToTray: false,
    startAtLogin: false,
  });
  
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Simulate saving settings
    toast({
      title: "Settings updated",
      description: "Your preferences have been saved",
      duration: 2000,
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Display Settings</h3>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="theme">Theme</Label>
            <div className="flex items-center space-x-2">
              <Select
                value={theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}
              >
                <SelectTrigger className="w-[180px] bg-purple-dark/50 border border-purple-primary/30">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light" className="flex items-center">
                    <div className="flex items-center">
                      <Sun className="h-4 w-4 mr-2" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="h-4 w-4 mr-2" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center">
                      <Monitor className="h-4 w-4 mr-2" />
                      <span>System</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Security Timeouts</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-logout">Auto Logout</Label>
              <p className="text-sm text-muted-foreground">
                Automatically log out after a period of inactivity
              </p>
            </div>
            <Switch
              id="auto-logout"
              checked={settings.autoLogout}
              onCheckedChange={(checked) => handleSettingChange('autoLogout', checked)}
            />
          </div>
          
          {settings.autoLogout && (
            <div className="flex flex-col space-y-1.5 ml-6">
              <Label htmlFor="auto-logout-time">Logout After</Label>
              <Select
                value={settings.autoLogoutTime}
                onValueChange={(value) => handleSettingChange('autoLogoutTime', value)}
              >
                <SelectTrigger id="auto-logout-time" className="w-[180px] bg-purple-dark/50 border border-purple-primary/30">
                  <SelectValue placeholder="Select timeout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="clear-clipboard">Clear Clipboard</Label>
              <p className="text-sm text-muted-foreground">
                Automatically clear the clipboard after copying sensitive data
              </p>
            </div>
            <Switch
              id="clear-clipboard"
              checked={settings.clearClipboard}
              onCheckedChange={(checked) => handleSettingChange('clearClipboard', checked)}
            />
          </div>
          
          {settings.clearClipboard && (
            <div className="flex flex-col space-y-1.5 ml-6">
              <Label htmlFor="clear-clipboard-time">Clear After</Label>
              <Select
                value={settings.clearClipboardTime}
                onValueChange={(value) => handleSettingChange('clearClipboardTime', value)}
              >
                <SelectTrigger id="clear-clipboard-time" className="w-[180px] bg-purple-dark/50 border border-purple-primary/30">
                  <SelectValue placeholder="Select timeout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Application Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-strength">Show Password Strength</Label>
              <p className="text-sm text-muted-foreground">
                Display password strength indicators in vault
              </p>
            </div>
            <Switch
              id="show-strength"
              checked={settings.showPasswordStrength}
              onCheckedChange={(checked) => handleSettingChange('showPasswordStrength', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="minimize-tray">Minimize to System Tray</Label>
              <p className="text-sm text-muted-foreground">
                Keep the app running in the system tray when closed
              </p>
            </div>
            <Switch
              id="minimize-tray"
              checked={settings.minimizeToTray}
              onCheckedChange={(checked) => handleSettingChange('minimizeToTray', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="start-login">Start at Login</Label>
              <p className="text-sm text-muted-foreground">
                Launch the application automatically at system startup
              </p>
            </div>
            <Switch
              id="start-login"
              checked={settings.startAtLogin}
              onCheckedChange={(checked) => handleSettingChange('startAtLogin', checked)}
            />
          </div>
        </div>
      </div>
      
      <div className="pt-4 flex justify-between">
        <Button 
          variant="outline" 
          className="border-purple-primary text-purple-primary hover:bg-purple-primary/10"
          onClick={() => {
            setSettings({
              autoLogout: true,
              autoLogoutTime: '15',
              clearClipboard: true,
              clearClipboardTime: '30',
              showPasswordStrength: true,
              minimizeToTray: false,
              startAtLogin: false,
            });
            
            toast({
              title: "Settings reset",
              description: "Your preferences have been reset to default values",
            });
          }}
        >
          Reset to Defaults
        </Button>
        
        <Button 
          className="bg-purple-primary hover:bg-purple-accent text-white"
          onClick={() => {
            toast({
              title: "Settings saved",
              description: "Your app settings have been saved successfully",
            });
          }}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
