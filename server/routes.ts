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

      // In debug mode, allow overwriting existing subdomains
      if (process.env.DEBUG_MODE === 'true') {
        const existing = await storage.getSubdomain(subdomain);
        if (existing) {
          await storage.clearSubdomain(subdomain);
        }
      } else {
        // Check if subdomain already exists
        const existingSubdomain = await storage.getSubdomain(subdomain);
        if (existingSubdomain) {
          return res.status(409).json({
            success: false,
            error: `Subdomain ${subdomain} already exists`
          } as ApiResponse);
        }
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
        // Check if we're in DEBUG mode (to bypass actual API calls)
        const isDebugMode = process.env.DEBUG_MODE === 'true';
        let recordData: PorkbunApiResponse;

        if (isDebugMode) {
          console.log(`
===========================================================
[DEBUG MODE] 
Creating ${recordType} record for ${subdomain}.beenshub.rest 
Value: ${recordValue}
===========================================================
`);
          // Simulate successful response
          recordData = {
            status: "SUCCESS"
          };
        } else {
          // Make actual API call to Porkbun
          // Log request for debugging
          console.log("Making Porkbun API request to create DNS record:");
          console.log(`Domain: beenshub.rest, Subdomain: ${subdomain}`);
          console.log(`Record Type: ${recordType}, Value: ${recordValue}`);

          const recordResponse = await axios.post(
            "https://api-sandbox.porkbun.com/api/json/v3/dns/create/beenshub.rest",
            {
              apikey: apiKey,
              secretapikey: secretKey,
              name: subdomain,
              type: recordType,
              content: recordValue,
              ttl: "600",
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          recordData = recordResponse.data as PorkbunApiResponse;
        }

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
        // Enhanced error logging for Porkbun API errors
        console.error("Porkbun API error:", error.message);

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Request setup error:", error.message);
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