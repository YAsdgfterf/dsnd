import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ApiResponse, PorkbunApiResponse, subdomainValidator } from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for subdomain management
  app.post("/api/subdomains", async (req: Request, res: Response) => {
    try {
      // Validate the subdomain format
      const validation = subdomainValidator.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.errors[0].message
        } as ApiResponse);
      }

      const { subdomain } = validation.data;

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

      // Creating A and CNAME DNS records for the subdomain
      try {
        // Create the A record via Porkbun API
        const aRecordResponse = await axios.post(
          "https://porkbun.com/api/json/v3/dns/create/beenshub.rest",
          {
            secretapikey: secretKey,
            apikey: apiKey,
            name: subdomain,
            type: "A",
            content: "76.76.21.21", // Default IP address
            ttl: "600",
          }
        );

        const aRecordData = aRecordResponse.data as PorkbunApiResponse;

        if (aRecordData.status !== "SUCCESS") {
          return res.status(400).json({
            success: false,
            error: aRecordData.message || "Failed to create A record at Porkbun"
          } as ApiResponse);
        }

        // Create the CNAME record via Porkbun API
        const cnameRecordResponse = await axios.post(
          "https://porkbun.com/api/json/v3/dns/create/beenshub.rest",
          {
            secretapikey: secretKey,
            apikey: apiKey,
            name: `www.${subdomain}`,
            type: "CNAME",
            content: `${subdomain}.beenshub.rest`,
            ttl: "600",
          }
        );

        const cnameRecordData = cnameRecordResponse.data as PorkbunApiResponse;

        if (cnameRecordData.status === "SUCCESS") {
          // Save the subdomain to our storage if both records were created successfully
          await storage.createSubdomain({ subdomain });
          
          return res.status(201).json({
            success: true,
            message: `Subdomain ${subdomain}.beenshub.rest created successfully with A and CNAME records`,
            data: { 
              subdomain,
              records: {
                a: `${subdomain}.beenshub.rest`,
                cname: `www.${subdomain}.beenshub.rest`
              }
            }
          } as ApiResponse);
        } else {
          return res.status(400).json({
            success: false,
            error: cnameRecordData.message || "Failed to create CNAME record at Porkbun"
          } as ApiResponse);
        }
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
