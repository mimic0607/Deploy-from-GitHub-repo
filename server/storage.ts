import { 
  User, InsertUser, 
  VaultItem, InsertVaultItem,
  PasswordShare, InsertPasswordShare,
  CryptoDocument, InsertCryptoDocument,
  PasswordBackup, InsertPasswordBackup
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Vault item methods
  getVaultItems(userId: number): Promise<VaultItem[]>;
  getVaultItem(id: number): Promise<VaultItem | undefined>;
  createVaultItem(item: InsertVaultItem): Promise<VaultItem>;
  updateVaultItem(id: number, item: Partial<VaultItem>): Promise<VaultItem | undefined>;
  deleteVaultItem(id: number): Promise<boolean>;
  
  // Password sharing methods
  createPasswordShare(share: InsertPasswordShare): Promise<PasswordShare>;
  getPasswordShareById(id: number): Promise<PasswordShare | undefined>;
  getPasswordSharesByUser(userId: number): Promise<PasswordShare[]>;
  getPasswordSharesByEmail(email: string): Promise<PasswordShare[]>;
  deletePasswordShare(id: number): Promise<boolean>;
  
  // Crypto document methods
  createCryptoDocument(doc: InsertCryptoDocument): Promise<CryptoDocument>;
  getCryptoDocumentsByUser(userId: number): Promise<CryptoDocument[]>;
  getCryptoDocument(id: number): Promise<CryptoDocument | undefined>;
  deleteCryptoDocument(id: number): Promise<boolean>;
  
  // Password backup methods
  createPasswordBackup(backup: InsertPasswordBackup): Promise<PasswordBackup>;
  getPasswordBackupsByUser(userId: number): Promise<PasswordBackup[]>;
  getLatestPasswordBackup(userId: number): Promise<PasswordBackup | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vaultItems: Map<number, VaultItem>;
  private passwordShares: Map<number, PasswordShare>;
  private cryptoDocuments: Map<number, CryptoDocument>;
  private passwordBackups: Map<number, PasswordBackup>;
  
  private userIdCounter: number;
  private vaultItemIdCounter: number;
  private passwordShareIdCounter: number;
  private cryptoDocumentIdCounter: number;
  private passwordBackupIdCounter: number;

  constructor() {
    this.users = new Map();
    this.vaultItems = new Map();
    this.passwordShares = new Map();
    this.cryptoDocuments = new Map();
    this.passwordBackups = new Map();
    
    this.userIdCounter = 1;
    this.vaultItemIdCounter = 1;
    this.passwordShareIdCounter = 1;
    this.cryptoDocumentIdCounter = 1;
    this.passwordBackupIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Vault item methods
  async getVaultItems(userId: number): Promise<VaultItem[]> {
    return Array.from(this.vaultItems.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async getVaultItem(id: number): Promise<VaultItem | undefined> {
    return this.vaultItems.get(id);
  }

  async createVaultItem(item: InsertVaultItem): Promise<VaultItem> {
    const id = this.vaultItemIdCounter++;
    const now = new Date();
    const vaultItem: VaultItem = { 
      ...item, 
      id, 
      createdAt: now, 
      lastUsed: item.lastUsed || now 
    };
    this.vaultItems.set(id, vaultItem);
    return vaultItem;
  }

  async updateVaultItem(id: number, updates: Partial<VaultItem>): Promise<VaultItem | undefined> {
    const item = await this.getVaultItem(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates };
    this.vaultItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteVaultItem(id: number): Promise<boolean> {
    return this.vaultItems.delete(id);
  }

  // Password sharing methods
  async createPasswordShare(share: InsertPasswordShare): Promise<PasswordShare> {
    const id = this.passwordShareIdCounter++;
    const now = new Date();
    const passwordShare: PasswordShare = { ...share, id, createdAt: now };
    this.passwordShares.set(id, passwordShare);
    return passwordShare;
  }

  async getPasswordShareById(id: number): Promise<PasswordShare | undefined> {
    return this.passwordShares.get(id);
  }

  async getPasswordSharesByUser(userId: number): Promise<PasswordShare[]> {
    return Array.from(this.passwordShares.values()).filter(
      (share) => share.senderId === userId,
    );
  }

  async getPasswordSharesByEmail(email: string): Promise<PasswordShare[]> {
    return Array.from(this.passwordShares.values()).filter(
      (share) => share.recipientEmail === email,
    );
  }

  async deletePasswordShare(id: number): Promise<boolean> {
    return this.passwordShares.delete(id);
  }

  // Crypto document methods
  async createCryptoDocument(doc: InsertCryptoDocument): Promise<CryptoDocument> {
    const id = this.cryptoDocumentIdCounter++;
    const now = new Date();
    const cryptoDoc: CryptoDocument = { ...doc, id, createdAt: now };
    this.cryptoDocuments.set(id, cryptoDoc);
    return cryptoDoc;
  }

  async getCryptoDocumentsByUser(userId: number): Promise<CryptoDocument[]> {
    return Array.from(this.cryptoDocuments.values()).filter(
      (doc) => doc.userId === userId,
    );
  }

  async getCryptoDocument(id: number): Promise<CryptoDocument | undefined> {
    return this.cryptoDocuments.get(id);
  }

  async deleteCryptoDocument(id: number): Promise<boolean> {
    return this.cryptoDocuments.delete(id);
  }

  // Password backup methods
  async createPasswordBackup(backup: InsertPasswordBackup): Promise<PasswordBackup> {
    const id = this.passwordBackupIdCounter++;
    const now = new Date();
    const passwordBackup: PasswordBackup = { ...backup, id, createdAt: now };
    this.passwordBackups.set(id, passwordBackup);
    return passwordBackup;
  }

  async getPasswordBackupsByUser(userId: number): Promise<PasswordBackup[]> {
    return Array.from(this.passwordBackups.values()).filter(
      (backup) => backup.userId === userId,
    );
  }

  async getLatestPasswordBackup(userId: number): Promise<PasswordBackup | undefined> {
    const userBackups = await this.getPasswordBackupsByUser(userId);
    if (userBackups.length === 0) return undefined;
    
    return userBackups.reduce((latest, current) => {
      return latest.createdAt > current.createdAt ? latest : current;
    });
  }
}

export const storage = new MemStorage();
