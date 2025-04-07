import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  masterPassword: text("master_password").notNull(),
  email: text("email"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vaultItems = pgTable("vault_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  url: text("url"),
  username: text("username").notNull(),
  password: text("password").notNull(), // Encrypted with AES
  category: text("category"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used"),
  expiryDate: timestamp("expiry_date"),
});

export const passwordShares = pgTable("password_shares", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  vaultItemId: integer("vault_item_id").notNull().references(() => vaultItems.id),
  recipientEmail: text("recipient_email").notNull(),
  encryptedData: text("encrypted_data").notNull(),
  expiresAt: timestamp("expires_at"),
  accessCode: text("access_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cryptoDocuments = pgTable("crypto_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "encrypted" or "hashed"
  name: text("name").notNull(),
  data: text("data").notNull(),
  algorithm: text("algorithm").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordBackups = pgTable("password_backups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  data: text("data").notNull(), // Encrypted backup data
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas and Types
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVaultItemSchema = createInsertSchema(vaultItems).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
});

export const insertPasswordShareSchema = createInsertSchema(passwordShares).omit({
  id: true,
  createdAt: true,
});

export const insertCryptoDocumentSchema = createInsertSchema(cryptoDocuments).omit({
  id: true,
  createdAt: true,
});

export const insertPasswordBackupSchema = createInsertSchema(passwordBackups).omit({
  id: true,
  createdAt: true,
});

// Export Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVaultItem = z.infer<typeof insertVaultItemSchema>;
export type VaultItem = typeof vaultItems.$inferSelect;

export type InsertPasswordShare = z.infer<typeof insertPasswordShareSchema>;
export type PasswordShare = typeof passwordShares.$inferSelect;

export type InsertCryptoDocument = z.infer<typeof insertCryptoDocumentSchema>;
export type CryptoDocument = typeof cryptoDocuments.$inferSelect;

export type InsertPasswordBackup = z.infer<typeof insertPasswordBackupSchema>;
export type PasswordBackup = typeof passwordBackups.$inferSelect;
