import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppSettings from '@/components/settings/AppSettings';
import AccountSettings from '@/components/settings/AccountSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import ImportExportSettings from '@/components/settings/ImportExportSettings';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  
  return (
    <AppLayout title="Settings">
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-purple-primary/20 mb-6">
            <TabsList className="bg-transparent">
              <TabsTrigger 
                value="account" 
                className="px-4 py-2 data-[state=active]:text-purple-primary data-[state=active]:border-b-2 data-[state=active]:border-purple-primary rounded-none bg-transparent"
              >
                Account
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="px-4 py-2 data-[state=active]:text-purple-primary data-[state=active]:border-b-2 data-[state=active]:border-purple-primary rounded-none bg-transparent"
              >
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="import-export" 
                className="px-4 py-2 data-[state=active]:text-purple-primary data-[state=active]:border-b-2 data-[state=active]:border-purple-primary rounded-none bg-transparent"
              >
                Import / Export
              </TabsTrigger>
              <TabsTrigger 
                value="app" 
                className="px-4 py-2 data-[state=active]:text-purple-primary data-[state=active]:border-b-2 data-[state=active]:border-purple-primary rounded-none bg-transparent"
              >
                App Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="account" className="mt-0">
            <AccountSettings />
          </TabsContent>
          
          <TabsContent value="security" className="mt-0">
            <SecuritySettings />
          </TabsContent>
          
          <TabsContent value="import-export" className="mt-0">
            <ImportExportSettings />
          </TabsContent>
          
          <TabsContent value="app" className="mt-0">
            <AppSettings />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Help and Support Section */}
      <div className="glass-card rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Help & Support</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-purple-primary/10 p-4 rounded-lg text-center">
            <div className="h-12 w-12 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="font-medium mb-2">FAQ</h3>
            <p className="text-sm text-gray-300 mb-3">
              Find answers to the most common questions about SecurePass.
            </p>
            <a href="#" className="text-purple-primary text-sm hover:underline">View FAQs</a>
          </div>
          
          <div className="bg-purple-primary/10 p-4 rounded-lg text-center">
            <div className="h-12 w-12 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <h3 className="font-medium mb-2">Contact Support</h3>
            <p className="text-sm text-gray-300 mb-3">
              Need help? Our support team is ready to assist you.
            </p>
            <a href="#" className="text-purple-primary text-sm hover:underline">Contact Us</a>
          </div>
          
          <div className="bg-purple-primary/10 p-4 rounded-lg text-center">
            <div className="h-12 w-12 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-primary mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </div>
            <h3 className="font-medium mb-2">Feedback</h3>
            <p className="text-sm text-gray-300 mb-3">
              We're constantly improving. Share your thoughts and suggestions.
            </p>
            <a href="#" className="text-purple-primary text-sm hover:underline">Give Feedback</a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-purple-primary/20 text-center">
          <p className="text-sm text-gray-400">
            SecurePass v1.0.0 &copy; {new Date().getFullYear()} | 
            <a href="#" className="text-purple-primary ml-2 hover:underline">Privacy Policy</a> | 
            <a href="#" className="text-purple-primary ml-2 hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
