import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

// Define the shape of a notification
interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  title?: string;
  [key: string]: any; // Allow for additional properties
}

// Define the WebSocket context shape
interface WebSocketContextType {
  connected: boolean;
  notifications: Notification[];
  clearNotifications: () => void;
  sendMessage: (messageData: any) => void;
}

// Create the context with a default value
const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  notifications: [],
  clearNotifications: () => {},
  sendMessage: () => {}
});

// Custom hook for using the WebSocket context
export const useWebSocket = () => useContext(WebSocketContext);

// WebSocket provider component
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  // Initialize WebSocket connection
  useEffect(() => {
    // TEMPORARY: Allow websocket connection without authentication for testing purposes
    // This will be removed when we have the Firebase credentials
    const BYPASS_AUTH = true;
    
    if (!user && !BYPASS_AUTH) {
      // Don't connect if not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Determine WebSocket URL based on current URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    // Event handlers
    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Authenticate with the WebSocket server
      ws.send(JSON.stringify({
        type: 'auth',
        userId: user?.id || 1 // Use temporary user ID if not authenticated
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if (data.type === 'notification') {
          // Add the notification to our list with a unique ID
          setNotifications(prev => [
            {
              ...data,
              id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
            },
            ...prev
          ]);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };
    
    setSocket(ws);
    
    // Clean up on unmount
    return () => {
      ws.close();
    };
  }, [user]);
  
  // Function to clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  // Function to send a message through the WebSocket
  const sendMessage = (messageData: any) => {
    if (socket && connected) {
      socket.send(JSON.stringify(messageData));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  };
  
  // Provide the WebSocket context to children
  return (
    <WebSocketContext.Provider 
      value={{ 
        connected, 
        notifications, 
        clearNotifications,
        sendMessage
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}