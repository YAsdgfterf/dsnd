import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ApiResponse, InsertSubdomain, RecordType, insertSubdomainSchema } from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/subdomains", async (req: Request, res: Response) => {
    try {
      const validation = insertSubdomainSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.errors[0].message
        } as ApiResponse);
      }

      const { subdomain, recordType, recordValue } = validation.data;

      if (process.env.DEBUG_MODE === 'true') {
        const existing = await storage.getSubdomain(subdomain);
        if (existing) {
          await storage.clearSubdomain(subdomain);
        }
      } else {
        const existingSubdomain = await storage.getSubdomain(subdomain);
        if (existingSubdomain) {
          return res.status(409).json({
            success: false,
            error: `Subdomain ${subdomain} already exists`
          } as ApiResponse);
        }
      }

      const apiKey = process.env.GODADDY_API_KEY;
      const apiSecret = process.env.GODADDY_API_SECRET;

      if (!apiKey || !apiSecret) {
        return res.status(500).json({
          success: false,
          error: "API credentials not configured"
        } as ApiResponse);
      }

      try {
        const isDebugMode = process.env.DEBUG_MODE === 'true';
        let recordData;

        if (isDebugMode) {
          console.log(`
===========================================================
[DEBUG MODE] 
Creating ${recordType} record for ${subdomain}.beenshub.lol 
Value: ${recordValue}
===========================================================
`);
          recordData = { success: true };
        } else {
          console.log("Making GoDaddy API request to create DNS record:");
          console.log(`Domain: beenshub.lol, Subdomain: ${subdomain}`);
          console.log(`Record Type: ${recordType}, Value: ${recordValue}`);

          const response = await axios.put(
            "https://api.godaddy.com/v1/domains/beenshub.lol/records",
            [
              {
                name: subdomain,
                type: recordType,
                data: recordValue,
                ttl: 600
              },
              {
                name: "@",
                type: "NS",
                data: "ns73.domaincontrol.com",
                ttl: 3600
              },
              {
                name: "@",
                type: "NS",
                data: "ns74.domaincontrol.com",
                ttl: 3600
              }
            ],
            {
              headers: {
                'Authorization': `sso-key ${apiKey}:${apiSecret}`,
                'Content-Type': 'application/json'
              }
            }
          );

          recordData = { success: response.status === 200 };
        }

        if (!recordData.success) {
          return res.status(400).json({
            success: false,
            error: `Failed to create ${recordType} record at GoDaddy`
          } as ApiResponse);
        }

        const data: InsertSubdomain = {
          subdomain,
          recordType: recordType as RecordType,
          recordValue
        };
        await storage.createSubdomain(data);

        return res.status(201).json({
          success: true,
          message: `Subdomain ${subdomain}.beenshub.lol created successfully with ${recordType} record`,
          data: { 
            subdomain,
            record: {
              type: recordType,
              name: `${subdomain}.beenshub.lol`,
              value: recordValue
            }
          }
        } as ApiResponse);
      } catch (error: any) {
        console.error("GoDaddy API error:", error.message);

        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
        }

        return res.status(500).json({
          success: false,
          error: "Error communicating with DNS provider: " + 
                 (error.response?.data?.message || error.message)
        } as ApiResponse);
      }
    } catch (error: any) {
      console.error("Subdomain creation error:", error);

      return res.status(500).json({
        success: false,
        error: error.message || "An unexpected error occurred"
      } as ApiResponse);
    }
  });

  app.get("/api/subdomains/:name", async (req: Request, res: Response) => {
    try {
      const subdomain = await storage.getSubdomain(req.params.name);

      return res.json({
        success: true,
        data: { exists: !!subdomain }
      } as ApiResponse);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}