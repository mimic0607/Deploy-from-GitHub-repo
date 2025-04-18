import { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

/**
 * Props for the PasswordExpiryNotification component
 */
interface PasswordExpiryNotificationProps {
  daysWarning?: number;
}

/**
 * Component that displays a notification for expiring passwords
 */
export function PasswordExpiryNotification({ daysWarning = 7 }: PasswordExpiryNotificationProps) {
  // Use any for expiringItems to avoid type conflicts
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Fetch expiring passwords
  const fetchExpiringPasswords = async () => {
    try {
      setIsLoading(true);
      // Parse the JSON response manually for type safety
      const response = await fetch(`/api/check-expiring-passwords?daysWarning=${daysWarning}`);
      const data = await response.json() as { expiringCount: number, expiringItems: any[] };
      
      if (response.ok) {
        setExpiringItems(data.expiringItems);
        
        // Show a toast notification if there are expiring items
        if (data.expiringCount > 0 && !isOpen) {
          toast({
            title: `Password Security Alert`,
            description: `You have ${data.expiringCount} password${data.expiringCount === 1 ? '' : 's'} expiring soon.`,
            variant: "destructive",
            action: (
              <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>
                View
              </Button>
            ),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching expiring passwords:', error);
      toast({
        title: 'Error',
        description: 'Failed to check for expiring passwords.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initially
    fetchExpiringPasswords();
    
    // Set up interval to check periodically (every hour)
    const intervalId = setInterval(fetchExpiringPasswords, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [daysWarning]);

  // Send email notification
  const sendEmailNotification = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notify-expiring-passwords?daysWarning=${daysWarning}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sendEmail: true })
      });
      
      const data = await response.json() as { success: boolean, notificationsSent: any };
      
      if (response.ok && data.success) {
        toast({
          title: 'Notification Sent',
          description: data.notificationsSent.emailSent 
            ? 'Email notification sent successfully.' 
            : 'Notification processed, but email could not be sent. Please check your email settings.',
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Always show the bell icon, even if there are no notifications

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {expiringItems.length > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white"
            >
              {expiringItems.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {expiringItems.length > 0 ? (
                <>
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                  Password Security Alert
                </>
              ) : (
                <>
                  <Bell className="h-5 w-5 mr-2 text-slate-500" />
                  Notifications
                </>
              )}
            </CardTitle>
            <CardDescription>
              {expiringItems.length > 0 
                ? "The following passwords are expiring soon or have already expired."
                : "You'll be notified here when your passwords are about to expire."}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-72 overflow-y-auto">
            {expiringItems.length > 0 ? (
              expiringItems.map((item) => {
                const expiryDate = new Date(item.expiryDate);
                const isExpired = new Date() > expiryDate;
                
                return (
                  <div 
                    key={item.id} 
                    className="border-b border-gray-200 dark:border-gray-700 py-2 last:border-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.username}</p>
                      </div>
                      <Badge variant={isExpired ? "destructive" : "outline"} className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {isExpired 
                          ? 'Expired' 
                          : `Expires ${formatDistanceToNow(expiryDate, { addSuffix: true })}`}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-6 w-6 text-green-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                </div>
                <h3 className="text-base font-medium">All Good!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No passwords are expiring soon.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
            {expiringItems.length > 0 && (
              <Button
                onClick={sendEmailNotification}
                disabled={isLoading}
              >
                Send Me Email Reminder
              </Button>
            )}
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}