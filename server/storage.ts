import { subdomains, type Subdomain, type InsertSubdomain } from "@shared/schema";

// Interface for the storage methods
export interface IStorage {
  createSubdomain(subdomain: InsertSubdomain): Promise<Subdomain>;
  getSubdomain(subdomain: string): Promise<Subdomain | undefined>;
  getAllSubdomains(): Promise<Subdomain[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private subdomains: Map<number, Subdomain>;
  private currentId: number;

  constructor() {
    this.subdomains = new Map();
    this.currentId = 1;
  }

  async createSubdomain(insertSubdomain: InsertSubdomain): Promise<Subdomain> {
    // Check if subdomain already exists
    const existing = await this.getSubdomain(insertSubdomain.subdomain);
    if (existing) {
      throw new Error(`Subdomain ${insertSubdomain.subdomain} already exists`);
    }

    const id = this.currentId++;
    const subdomain: Subdomain = {
      ...insertSubdomain,
      id,
      createdAt: new Date(),
    };
    this.subdomains.set(id, subdomain);
    return subdomain;
  }

  async getSubdomain(subdomainName: string): Promise<Subdomain | undefined> {
    return Array.from(this.subdomains.values()).find(
      (record) => record.subdomain.toLowerCase() === subdomainName.toLowerCase()
    );
  }

  async getAllSubdomains(): Promise<Subdomain[]> {
    return Array.from(this.subdomains.values());
  }
}

// Export a singleton instance of the storage
export const storage = new MemStorage();
