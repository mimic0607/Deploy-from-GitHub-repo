import express, { Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { PasswordService } from "./services/passwordService";
import { CryptoService } from "./services/cryptoService";
import { NotificationService } from "./services/notificationService";
import { isPasswordExpiring, isPasswordExpired } from "./utils/passwordUtils";
import { insertVaultItemSchema, insertCryptoDocumentSchema, insertPasswordShareSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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
      // In a real app, this would use the authenticated user's ID
      const userId = 1; // Mock user ID
      
      const vaultItems = await storage.getVaultItems(userId);
      return res.json(vaultItems);
    } catch (error) {
      console.error('Error fetching vault items:', error);
      return res.status(500).json({ error: 'Failed to fetch vault items' });
    }
  });
  
  apiRouter.post('/vault', async (req: Request, res: Response) => {
    try {
      const validationResult = insertVaultItemSchema.safeParse(req.body);
      
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
      // In a real app, this would use the authenticated user's ID
      const userId = 1; // Mock user ID
      
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
      // In a real app, this would use the authenticated user's ID
      const userId = 1; // Mock user ID
      
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
      // In a real app, this would use the authenticated user's ID
      const userId = 1; // Mock user ID
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
      // In a real app, this would use the authenticated user's ID
      const userId = 1; // Mock user ID
      const mockUser = { 
        id: userId, 
        email: 'user@example.com', 
        username: 'user',
        password: 'mockPassword',
        masterPassword: 'mockMasterPassword',
        twoFactorEnabled: false,
        twoFactorSecret: null,
        createdAt: new Date()
      };
      
      // Implementation would depend on the notification service
      // This could use email, SMS, push notifications, etc.
      const daysWarning = parseInt(req.query.daysWarning as string) || 7;
      const sendEmail = req.body.sendEmail || false;
      const notificationsSent = await NotificationService.notifyExpiringPasswords(mockUser, daysWarning, sendEmail);
      
      return res.json({ success: true, notificationsSent });
    } catch (error) {
      console.error('Error sending password expiry notifications:', error);
      return res.status(500).json({ error: 'Failed to send password expiry notifications' });
    }
  });

  // Mount API router at /api prefix
  app.use('/api', apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
