import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ApiResponse, InsertSubdomain, PorkbunApiResponse, RecordType, insertSubdomainSchema, subdomainValidator } from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for subdomain management
  app.post("/api/subdomains", async (req: Request, res: Response) => {
    try {
      // Validate the full request data
      const validation = insertSubdomainSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.errors[0].message
        } as ApiResponse);
      }

      const { subdomain, recordType, recordValue } = validation.data;

      // Check if subdomain already exists in our storage
      const existingSubdomain = await storage.getSubdomain(subdomain);
      if (existingSubdomain) {
        return res.status(409).json({
          success: false,
          error: `Subdomain ${subdomain} already exists`
        } as ApiResponse);
      }

      // Call Porkbun API to create the subdomain
      const apiKey = process.env.PORKBUN_API_KEY || process.env.API_KEY;
      const secretKey = process.env.PORKBUN_SECRET_KEY || process.env.SECRET_KEY;
      
      if (!apiKey || !secretKey) {
        return res.status(500).json({
          success: false,
          error: "API credentials not configured"
        } as ApiResponse);
      }

      // Creating a single DNS record based on the user's choice
      try {
        // Create the requested record via Porkbun API
        const recordResponse = await axios.post(
          "https://porkbun.com/api/json/v3/dns/create/beenshub.rest",
          {
            secretapikey: secretKey,
            apikey: apiKey,
            name: subdomain,
            type: recordType,
            content: recordValue,
            ttl: "600",
          }
        );

        const recordData = recordResponse.data as PorkbunApiResponse;

        if (recordData.status !== "SUCCESS") {
          return res.status(400).json({
            success: false,
            error: recordData.message || `Failed to create ${recordType} record at Porkbun`
          } as ApiResponse);
        }

        // Save the subdomain to our storage
        const data: InsertSubdomain = {
          subdomain,
          recordType: recordType as RecordType,
          recordValue
        };
        await storage.createSubdomain(data);
        
        return res.status(201).json({
          success: true,
          message: `Subdomain ${subdomain}.beenshub.rest created successfully with ${recordType} record`,
          data: { 
            subdomain,
            record: {
              type: recordType,
              name: `${subdomain}.beenshub.rest`,
              value: recordValue
            }
          }
        } as ApiResponse);
      } catch (error: any) {
        console.error("Porkbun API error:", error.response?.data || error.message);
        
        return res.status(500).json({
          success: false,
          error: "Error communicating with DNS provider: " + (error.response?.data?.message || error.message)
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

  // Check if a subdomain exists
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
