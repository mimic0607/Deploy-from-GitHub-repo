import { useWebSocket } from '@/lib/websocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, X, AlertCircle, Info, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationCenter() {
  const { notifications, clearNotifications } = useWebSocket();
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOpen = () => setIsOpen(!isOpen);
  
  const notificationCount = notifications.length;
  
  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={toggleOpen}
      >
        <Bell className="h-5 w-5" />
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-80 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-medium">Notifications</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                    <Info className="h-8 w-8 mb-2" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <CardContent className="px-4 py-2 grid gap-2">
                    {notifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </CardContent>
                )}
              </ScrollArea>
              
              <CardFooter className="p-2 flex justify-end border-t">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearNotifications}
                  disabled={notifications.length === 0}
                >
                  Clear all
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({ notification }: { notification: any }) {
  const getIcon = () => {
    switch (notification.severity) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };
  
  return (
    <div className={cn(
      "p-3 rounded-lg border",
      notification.severity === 'error' && "border-destructive bg-destructive/10",
      notification.severity === 'success' && "border-green-500/30 bg-green-500/10",
      notification.severity === 'info' && "border-primary/30 bg-primary/10",
      !notification.severity && "border-secondary"
    )}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          {notification.title && (
            <h4 className="text-sm font-medium mb-1">{notification.title}</h4>
          )}
          <p className="text-xs text-muted-foreground">{notification.message}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}