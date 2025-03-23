import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the subdomain records table
export const subdomains = pgTable("subdomains", {
  id: serial("id").primaryKey(),
  subdomain: text("subdomain").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create a schema for validating subdomain names
export const subdomainValidator = z.object({
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(63, "Subdomain must be at most 63 characters")
    .regex(
      /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/i,
      "Subdomain must contain only letters, numbers, and hyphens (cannot start or end with hyphen)"
    ),
});

// Schema for creating new subdomains
export const insertSubdomainSchema = createInsertSchema(subdomains).pick({
  subdomain: true,
});

// Types for the subdomain record
export type InsertSubdomain = z.infer<typeof insertSubdomainSchema>;
export type Subdomain = typeof subdomains.$inferSelect;

// API response types
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export interface PorkbunApiResponse {
  status: string;
  message?: string;
  [key: string]: any;
}
