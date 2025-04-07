import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Send, Bell, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { useWebSocket } from '@/lib/websocket';
import { useToast } from '@/hooks/use-toast';

export default function TestNotifications() {
  const { sendMessage, connected } = useWebSocket();
  const { toast } = useToast();
  const [notificationType, setNotificationType] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  // Function to send a test notification
  const sendTestNotification = () => {
    // This is just for testing - in a real application,
    // you would call the server API to send notifications
    
    if (!connected) {
      toast({
        title: "WebSocket disconnected",
        description: "Cannot send test notification while disconnected.",
        variant: "destructive",
      });
      return;
    }
    
    // Send a notification via the API
    fetch('/api/test-websocket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notificationType
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        toast({
          title: "Test notification sent",
          description: "Check the notification bell in the sidebar.",
        });
      } else {
        throw new Error(data.error || 'Failed to send notification');
      }
    })
    .catch(error => {
      console.error('Error sending test notification:', error);
      toast({
        title: "Notification failed",
        description: error.message || "Could not send test notification",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-purple-500/20">
      <h3 className="text-lg font-semibold mb-2">Test Notifications</h3>
      <p className="text-sm text-gray-400 mb-4">
        Send a test notification to verify the real-time notification system.
      </p>
      
      <div className="mb-4">
        <div className="text-sm mb-2">Notification Type:</div>
        <RadioGroup
          value={notificationType}
          onValueChange={(value) => setNotificationType(value as 'success' | 'info' | 'warning' | 'error')}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2 glass-card p-2 rounded-lg border border-purple-500/10">
            <RadioGroupItem value="info" id="type-info" />
            <Label htmlFor="type-info" className="flex items-center">
              <Info className="mr-1 h-4 w-4 text-blue-400" />
              <span>Info</span>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 glass-card p-2 rounded-lg border border-purple-500/10">
            <RadioGroupItem value="success" id="type-success" />
            <Label htmlFor="type-success" className="flex items-center">
              <CheckCircle className="mr-1 h-4 w-4 text-green-400" />
              <span>Success</span>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 glass-card p-2 rounded-lg border border-purple-500/10">
            <RadioGroupItem value="warning" id="type-warning" />
            <Label htmlFor="type-warning" className="flex items-center">
              <AlertTriangle className="mr-1 h-4 w-4 text-yellow-400" />
              <span>Warning</span>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 glass-card p-2 rounded-lg border border-purple-500/10">
            <RadioGroupItem value="error" id="type-error" />
            <Label htmlFor="type-error" className="flex items-center">
              <XCircle className="mr-1 h-4 w-4 text-red-400" />
              <span>Error</span>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          onClick={sendTestNotification}
          className="bg-purple-500 hover:bg-purple-600 text-white"
          disabled={!connected}
        >
          <Bell className="mr-2 h-4 w-4" />
          Send Test Notification
        </Button>
        <div className={`rounded-full h-3 w-3 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-xs text-gray-400">
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
}