import express, { Request, Response, NextFunction } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { PasswordService } from "./services/passwordService";
import { CryptoService } from "./services/cryptoService";
import { NotificationService } from "./services/notificationService";
import { isPasswordExpiring, isPasswordExpired } from "./utils/passwordUtils";
import { WebSocketServer, WebSocket } from 'ws';

// Extend WebSocket interface to add custom properties
interface SecureWebSocket extends WebSocket {
  userId?: number;
}

// Extend global namespace for our broadcast function
declare global {
  var broadcastNotification: (message: any, userId?: number) => void;
}
import { insertVaultItemSchema, insertCryptoDocumentSchema, insertPasswordShareSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Create API router
  const apiRouter = express.Router();
  
  // Password Analysis Route
  apiRouter.post('/analyze-password', async (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      
      const analysis = await PasswordService.analyzePassword(password);
      return res.json(analysis);
    } catch (error) {
      console.error('Error analyzing password:', error);
      return res.status(500).json({ error: 'Failed to analyze password' });
    }
  });
  
  // Password Generation Route
  apiRouter.post('/generate-password', (req: Request, res: Response) => {
    try {
      const { 
        length = 16, 
        includeUppercase = true, 
        includeLowercase = true, 
        includeNumbers = true, 
        includeSymbols = true,
        excludeAmbiguous = false
      } = req.body;
      
      const password = PasswordService.generatePassword(
        length, 
        includeUppercase, 
        includeLowercase, 
        includeNumbers, 
        includeSymbols,
        excludeAmbiguous
      );
      
      // Calculate entropy and crack time
      const entropy = PasswordService.calculateEntropy(password);
      const crackTime = PasswordService.estimateCrackTime(entropy);
      
      return res.json({
        password,
        entropy,
        crackTime
      });
    } catch (error) {
      console.error('Error generating password:', error);
      return res.status(500).json({ error: 'Failed to generate password' });
    }
  });
  
  // Vault Items Routes
  apiRouter.get('/vault', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const vaultItems = await storage.getVaultItems(userId);
      return res.json(vaultItems);
    } catch (error) {
      console.error('Error fetching vault items:', error);
      return res.status(500).json({ error: 'Failed to fetch vault items' });
    }
  });
  
  apiRouter.post('/vault', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      // Include the user ID in the data
      const itemWithUserId = { ...req.body, userId };
      
      const validationResult = insertVaultItemSchema.safeParse(itemWithUserId);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid vault item data',
          details: validationResult.error.errors
        });
      }
      
      const vaultItem = await storage.createVaultItem(validationResult.data);
      return res.status(201).json(vaultItem);
    } catch (error) {
      console.error('Error creating vault item:', error);
      return res.status(500).json({ error: 'Failed to create vault item' });
    }
  });
  
  apiRouter.put('/vault/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      
      const updatedItem = await storage.updateVaultItem(id, req.body);
      
      if (!updatedItem) {
        return res.status(404).json({ error: 'Vault item not found' });
      }
      
      return res.json(updatedItem);
    } catch (error) {
      console.error('Error updating vault item:', error);
      return res.status(500).json({ error: 'Failed to update vault item' });
    }
  });
  
  apiRouter.delete('/vault/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      
      const success = await storage.deleteVaultItem(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Vault item not found' });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting vault item:', error);
      return res.status(500).json({ error: 'Failed to delete vault item' });
    }
  });
  
  // Cryptographic Routes
  apiRouter.post('/encrypt', (req: Request, res: Response) => {
    try {
      const { text, key, algorithm = 'aes' } = req.body;
      
      if (!text || !key) {
        return res.status(400).json({ error: 'Text and key are required' });
      }
      
      let result;
      
      if (algorithm.toLowerCase() === 'aes') {
        result = CryptoService.encryptAES(text, key);
      } else if (algorithm.toLowerCase() === 'fernet') {
        result = { encrypted: CryptoService.encryptFernet(text, key) };
      } else {
        return res.status(400).json({ error: 'Unsupported encryption algorithm' });
      }
      
      return res.json(result);
    } catch (error) {
      console.error('Error encrypting data:', error);
      return res.status(500).json({ error: 'Failed to encrypt data' });
    }
  });
  
  apiRouter.post('/decrypt', (req: Request, res: Response) => {
    try {
      const { encrypted, iv, tag, key, algorithm = 'aes' } = req.body;
      
      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }
      
      let decrypted;
      
      if (algorithm.toLowerCase() === 'aes') {
        if (!encrypted || !iv || !tag) {
          return res.status(400).json({ error: 'Encrypted data, IV, and tag are required for AES decryption' });
        }
        
        decrypted = CryptoService.decryptAES({ encrypted, iv, tag }, key);
      } else if (algorithm.toLowerCase() === 'fernet') {
        if (!encrypted) {
          return res.status(400).json({ error: 'Encrypted data is required for Fernet decryption' });
        }
        
        decrypted = CryptoService.decryptFernet(encrypted, key);
      } else {
        return res.status(400).json({ error: 'Unsupported decryption algorithm' });
      }
      
      return res.json({ decrypted });
    } catch (error) {
      console.error('Error decrypting data:', error);
      return res.status(500).json({ error: 'Failed to decrypt data' });
    }
  });
  
  apiRouter.post('/hash', (req: Request, res: Response) => {
    try {
      const { text, algorithm = 'sha256' } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }
      
      const hash = CryptoService.createHash(text, algorithm);
      return res.json({ hash });
    } catch (error) {
      console.error('Error hashing data:', error);
      return res.status(500).json({ error: 'Failed to hash data' });
    }
  });
  
  apiRouter.post('/compare-hashes', (req: Request, res: Response) => {
    try {
      const { hash1, hash2 } = req.body;
      
      if (!hash1 || !hash2) {
        return res.status(400).json({ error: 'Both hashes are required' });
      }
      
      const match = CryptoService.compareHashes(hash1, hash2);
      return res.json({ match });
    } catch (error) {
      console.error('Error comparing hashes:', error);
      return res.status(500).json({ error: 'Failed to compare hashes' });
    }
  });
  
  // Crypto Documents (storing encrypted/hashed data)
  apiRouter.post('/crypto-documents', async (req: Request, res: Response) => {
    try {
      const validationResult = insertCryptoDocumentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid crypto document data',
          details: validationResult.error.errors
        });
      }
      
      const cryptoDoc = await storage.createCryptoDocument(validationResult.data);
      return res.status(201).json(cryptoDoc);
    } catch (error) {
      console.error('Error creating crypto document:', error);
      return res.status(500).json({ error: 'Failed to create crypto document' });
    }
  });
  
  apiRouter.get('/crypto-documents', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const cryptoDocs = await storage.getCryptoDocumentsByUser(userId);
      return res.json(cryptoDocs);
    } catch (error) {
      console.error('Error fetching crypto documents:', error);
      return res.status(500).json({ error: 'Failed to fetch crypto documents' });
    }
  });
  
  // Password Sharing
  apiRouter.post('/share-password', async (req: Request, res: Response) => {
    try {
      const validationResult = insertPasswordShareSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid password share data',
          details: validationResult.error.errors
        });
      }
      
      const passwordShare = await storage.createPasswordShare(validationResult.data);
      return res.status(201).json(passwordShare);
    } catch (error) {
      console.error('Error sharing password:', error);
      return res.status(500).json({ error: 'Failed to share password' });
    }
  });
  
  apiRouter.get('/shared-passwords', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const sharedPasswords = await storage.getPasswordSharesByUser(userId);
      return res.json(sharedPasswords);
    } catch (error) {
      console.error('Error fetching shared passwords:', error);
      return res.status(500).json({ error: 'Failed to fetch shared passwords' });
    }
  });
  
  // Password Expiry Checking and Notifications
  apiRouter.get('/check-expiring-passwords', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const daysWarning = parseInt(req.query.daysWarning as string) || 7;
      
      const vaultItems = await storage.getVaultItems(userId);
      
      // Use the imported utility functions
      
      // Filter items that are expiring or expired
      const expiringItems = vaultItems.filter(item => 
        isPasswordExpiring(item.expiryDate, daysWarning) || isPasswordExpired(item.expiryDate)
      );
      
      return res.json({
        expiringCount: expiringItems.length,
        expiringItems
      });
    } catch (error) {
      console.error('Error checking expiring passwords:', error);
      return res.status(500).json({ error: 'Failed to check expiring passwords' });
    }
  });
  
  apiRouter.post('/notify-expiring-passwords', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      // Check if this is a test notification request
      if (req.body.testNotification) {
        // Get notification type from the request
        const notificationType = req.body.notificationType || 'info';
        
        // Set messages based on notification type
        let title = 'Test Notification';
        let message = 'This is a test notification to verify the real-time notification system.';
        let severity = notificationType;
        
        switch (notificationType) {
          case 'success':
            title = 'Test Success';
            message = 'Your action has been completed successfully.';
            break;
          case 'warning':
            title = 'Test Warning';
            message = 'This is a warning notification. Please take action soon.';
            break;
          case 'error':
            title = 'Test Error';
            message = 'An error has occurred. Please check your configuration.';
            break;
          default: // info
            title = 'Test Information';
            message = 'This is an informational notification for your awareness.';
        }
        
        // Send a test notification directly through WebSocket
        global.broadcastNotification({
          title,
          message,
          severity,
          timestamp: new Date().toISOString()
        }, userId);
        
        return res.json({ 
          success: true, 
          message: 'Test notification sent',
          type: notificationType
        });
      }
      
      // Regular password expiry notification
      const daysWarning = parseInt(req.query.daysWarning as string) || 7;
      const sendEmail = req.body.sendEmail || false;
      const result = await NotificationService.notifyExpiringPasswords(req.user, daysWarning, sendEmail);
      
      return res.json({ 
        success: true, 
        expiringCount: result.expiringCount,
        expiredCount: result.expiredCount,
        emailSent: result.emailSent,
        notificationSent: result.notificationSent
      });
    } catch (error) {
      console.error('Error sending password expiry notifications:', error);
      return res.status(500).json({ error: 'Failed to send password expiry notifications' });
    }
  });

  // OAuth verification endpoint
  apiRouter.post('/verify-oauth', async (req: Request, res: Response) => {
    try {
      const { uid, email, displayName } = req.body;
      
      if (!uid || !email) {
        return res.status(400).json({ error: 'UID and email are required' });
      }
      
      // Check if user already exists by email
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user with OAuth data
        const username = displayName || email.split('@')[0];
        const generatedPassword = CryptoService.generateKey(12);
        const masterPassword = CryptoService.generateKey(16);
        
        user = await storage.createUser({
          username,
          email,
          password: generatedPassword, // This is a placeholder, user will never use this password
          masterPassword,
          firebaseUid: uid,
          isOAuthUser: true
        });
      } else if (!user.firebaseUid) {
        // Update existing user with firebase UID if it doesn't have one
        user = await storage.updateUser(user.id, { 
          firebaseUid: uid,
          isOAuthUser: true
        });
      }
      
      // Log the user in
      if (!user) {
        return res.status(500).json({ error: 'Failed to create or find user' });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error('Error logging in OAuth user:', err);
          return res.status(500).json({ error: 'Failed to login OAuth user' });
        }
        
        return res.status(200).json(user);
      });
    } catch (error) {
      console.error('Error verifying OAuth user:', error);
      return res.status(500).json({ error: 'Failed to verify OAuth user' });
    }
  });

  // Real-time notifications with WebSocket
  apiRouter.get('/notifications', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Return current notification settings
    return res.json({
      enabled: true,
      channels: ['websocket', 'inApp'],
      userId
    });
  });
  
  // Test WebSocket connection
  apiRouter.post('/test-websocket', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = req.user?.id;
    
    // Get notification type from the request
    const notificationType = req.body.notificationType || 'info';
    
    // Set messages based on notification type
    let title = 'Test Notification';
    let message = 'This is a test notification to verify the real-time notification system.';
    let severity = notificationType;
    
    switch (notificationType) {
      case 'success':
        title = 'Test Success';
        message = 'Your action has been completed successfully.';
        break;
      case 'warning':
        title = 'Test Warning';
        message = 'This is a warning notification. Please take action soon.';
        break;
      case 'error':
        title = 'Test Error';
        message = 'An error has occurred. Please check your configuration.';
        break;
      default: // info
        title = 'Test Information';
        message = 'This is an informational notification for your awareness.';
    }
    
    // Send a diagnostic message through WebSocket
    global.broadcastNotification({
      title,
      message,
      severity,
      timestamp: new Date().toISOString()
    }, userId);
    
    return res.json({
      success: true,
      message: 'Test message sent via WebSocket',
      type: notificationType,
      userId
    });
  });

  // Mount API router at /api prefix
  app.use('/api', apiRouter);
  
  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: SecureWebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        // Handle different message types
        if (data.type === 'auth') {
          // Authentication message would contain session info
          ws.userId = data.userId;
          ws.send(JSON.stringify({ 
            type: 'auth-response', 
            success: true,
            message: 'Authentication successful'
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Error processing message' 
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
    
    // Send a welcome message
    ws.send(JSON.stringify({ 
      type: 'info', 
      message: 'Connected to secure password utility suite WebSocket server' 
    }));
  });
  
  // Broadcast notifications to all connected clients or specific users
  global.broadcastNotification = (message: any, userId?: number) => {
    wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        // If userId is specified, only send to that user
        const secureClient = client as SecureWebSocket;
        if (!userId || secureClient.userId === userId) {
          client.send(JSON.stringify({
            type: 'notification',
            timestamp: new Date().toISOString(),
            ...message
          }));
        }
      }
    });
  };
  
  return httpServer;
}
