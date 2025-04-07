import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PasswordHealth from '@/components/dashboard/PasswordHealth';
import TestNotifications from '@/components/dashboard/TestNotifications';
import { Link } from 'wouter';
import { ArrowRight, Clock, AlertTriangle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useWebSocket } from '@/lib/websocket';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [expiringPasswords, setExpiringPasswords] = useState({
    loading: false,
    expiringCount: 0,
    expiredCount: 0,
    items: []
  });
  const { user } = useAuth();
  const { connected, notifications } = useWebSocket();
  const { toast } = useToast();

  // Define interface for vault items
  interface VaultItem {
    id: number;
    name: string;
    url?: string;
    expiryDate?: string;
    isExpired?: boolean;
    [key: string]: any;
  }

  // Check for expiring passwords on initial load
  useEffect(() => {
    if (user) {
      setExpiringPasswords(prev => ({ ...prev, loading: true }));
      
      fetch('/api/check-expiring-passwords')
        .then(res => res.json())
        .then(data => {
          setExpiringPasswords({
            loading: false,
            expiringCount: data.expiringItems.filter((item: VaultItem) => !item.isExpired).length,
            expiredCount: data.expiringItems.filter((item: VaultItem) => item.isExpired).length,
            items: data.expiringItems
          });
        })
        .catch(err => {
          console.error('Error checking for expiring passwords:', err);
          setExpiringPasswords(prev => ({ ...prev, loading: false }));
        });
    }
  }, [user]);

  // Listen for password expiration notifications
  useEffect(() => {
    const passwordNotifications = notifications.filter(
      (n) => n.title === 'Password Security Alert'
    );
    
    if (passwordNotifications.length > 0) {
      const latestNotification = passwordNotifications[0];
      if (latestNotification.data) {
        setExpiringPasswords({
          loading: false,
          expiringCount: latestNotification.data.expiringCount || 0,
          expiredCount: latestNotification.data.expiredCount || 0,
          items: latestNotification.data.items || []
        });
      }
    }
  }, [notifications]);

  // Function to check and send notifications about expiring passwords
  const notifyExpiringPasswords = async () => {
    try {
      const response = await fetch('/api/notify-expiring-passwords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sendEmail: false // Set to true if you want to send email notifications
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Notification sent",
          description: `Checked ${result.expiringCount + result.expiredCount} passwords for expiration.`,
        });
      }
    } catch (error) {
      console.error('Error sending password expiry notifications:', error);
      toast({
        title: "Notification failed",
        description: "Could not check for expiring passwords. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <AppLayout title="Dashboard">
      {/* Expiring Passwords Alert */}
      {(expiringPasswords.expiringCount > 0 || expiringPasswords.expiredCount > 0) && (
        <Card className="mb-6 border-yellow-500/30 bg-yellow-500/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-yellow-400 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Password Expiration Alert
            </CardTitle>
            <Button 
              onClick={notifyExpiringPasswords} 
              variant="outline" 
              size="sm"
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
            >
              <Bell className="mr-2 h-4 w-4" />
              Notify Me
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">
              {expiringPasswords.expiredCount > 0 && (
                <span className="text-red-400 font-semibold">
                  {expiringPasswords.expiredCount} password{expiringPasswords.expiredCount !== 1 ? 's' : ''} expired. 
                </span>
              )}
              {expiringPasswords.expiringCount > 0 && (
                <span className="text-yellow-400 font-semibold">
                  {expiringPasswords.expiringCount} password{expiringPasswords.expiringCount !== 1 ? 's' : ''} expiring soon.
                </span>
              )}
              {' '}Please update these passwords as soon as possible.
            </p>
            <div className="flex gap-2 mt-2">
              <Link href="/vault">
                <Button size="sm" variant="secondary">
                  <Clock className="mr-2 h-4 w-4" />
                  Manage Passwords
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Overview Cards */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6">Welcome to SecurePass</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 border border-purple-500/10 flex items-center justify-between glow-effect">
            <div>
              <h3 className="text-sm font-medium text-gray-300">Total Passwords</h3>
              <p className="text-2xl font-bold mt-1">27</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4 border border-purple-500/10 flex items-center justify-between glow-effect">
            <div>
              <h3 className="text-sm font-medium text-gray-300">Security Score</h3>
              <p className="text-2xl font-bold mt-1">85%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4 border border-purple-500/10 flex items-center justify-between glow-effect">
            <div>
              <h3 className="text-sm font-medium text-gray-300">Weak Passwords</h3>
              <p className="text-2xl font-bold mt-1 text-warning">4</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4 border border-purple-500/10 flex items-center justify-between glow-effect">
            <div>
              <h3 className="text-sm font-medium text-gray-300">Data Breaches</h3>
              <p className="text-2xl font-bold mt-1 text-danger">3</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-danger/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Access to Tools */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Password Utility Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-5 border border-purple-500/10 hover:border-purple-500/30 transition-all">
            <h3 className="text-lg font-semibold mb-2">Password Generator</h3>
            <p className="text-gray-400 mb-4">Create secure, randomized passwords with customizable options for length and character types.</p>
            <Link href="/password-generator">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                Generate Passwords <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="glass-card rounded-xl p-5 border border-purple-500/10 hover:border-purple-500/30 transition-all">
            <h3 className="text-lg font-semibold mb-2">Password Strength Checker</h3>
            <p className="text-gray-400 mb-4">Test your existing passwords against security best practices and data breach databases.</p>
            <Link href="/password-checker">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                Check Password Strength <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Test Notifications */}
      <div className="mb-6">
        <TestNotifications />
      </div>
      
      {/* Password Health Dashboard */}
      <PasswordHealth />
    </AppLayout>
  );
}
