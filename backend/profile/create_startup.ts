import { api, APIError } from "encore.dev/api";
import { profileDB } from "./db";

export interface CreateStartupRequest {
  founderId: number;
  name: string;
  description?: string;
  industry?: string;
  stage?: string;
  fundingAmount?: number;
  location?: string;
  websiteUrl?: string;
  logoUrl?: string;
  foundedYear?: number;
  employeeCount?: number;
}

export interface Startup {
  id: number;
  founderId: number;
  name: string;
  description?: string;
  industry?: string;
  stage?: string;
  fundingAmount?: number;
  location?: string;
  websiteUrl?: string;
  logoUrl?: string;
  foundedYear?: number;
  employeeCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new startup for a founder.
export const createStartup = api<CreateStartupRequest, Startup>(
  { expose: true, method: "POST", path: "/profiles/startup" },
  async (req) => {
    if (!req.name) {
      throw APIError.invalidArgument("startup name is required");
    }

    // Verify founder exists
    const founder = await profileDB.queryRow`
      SELECT id FROM founder_profiles WHERE id = ${req.founderId}
    `;

    if (!founder) {
      throw APIError.notFound("founder profile not found");
    }

    // Check if startup already exists for this founder
    const existing = await profileDB.queryRow`
      SELECT id FROM startups WHERE founder_id = ${req.founderId}
    `;

    if (existing) {
      throw APIError.alreadyExists("startup already exists for this founder");
    }

    const startup = await profileDB.queryRow<{
      id: number;
      founder_id: number;
      name: string;
      description: string | null;
      industry: string | null;
      stage: string | null;
      funding_amount: number | null;
      location: string | null;
      website_url: string | null;
      logo_url: string | null;
      founded_year: number | null;
      employee_count: number | null;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO startups (
        founder_id, name, description, industry, stage, funding_amount,
        location, website_url, logo_url, founded_year, employee_count
      )
      VALUES (
        ${req.founderId}, ${req.name}, ${req.description || null}, 
        ${req.industry || null}, ${req.stage || null}, ${req.fundingAmount || null},
        ${req.location || null}, ${req.websiteUrl || null}, ${req.logoUrl || null},
        ${req.foundedYear || null}, ${req.employeeCount || null}
      )
      RETURNING *
    `;

    if (!startup) {
      throw APIError.internal("failed to create startup");
    }

    return {
      id: startup.id,
      founderId: startup.founder_id,
      name: startup.name,
      description: startup.description || undefined,
      industry: startup.industry || undefined,
      stage: startup.stage || undefined,
      fundingAmount: startup.funding_amount || undefined,
      location: startup.location || undefined,
      websiteUrl: startup.website_url || undefined,
      logoUrl: startup.logo_url || undefined,
      foundedYear: startup.founded_year || undefined,
      employeeCount: startup.employee_count || undefined,
      createdAt: startup.created_at,
      updatedAt: startup.updated_at,
    };
  }
);
