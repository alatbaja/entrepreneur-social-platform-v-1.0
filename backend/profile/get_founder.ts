import { api, APIError } from "encore.dev/api";
import { profileDB } from "./db";

export interface GetFounderProfileRequest {
  id: number;
}

export interface FounderProfileWithStartup {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  startup?: {
    id: number;
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
  };
  createdAt: Date;
  updatedAt: Date;
}

// Retrieves a founder profile with their startup information.
export const getFounderProfile = api<GetFounderProfileRequest, FounderProfileWithStartup>(
  { expose: true, method: "GET", path: "/profiles/founder/:id" },
  async (req) => {
    const profile = await profileDB.queryRow<{
      id: number;
      user_id: number;
      first_name: string;
      last_name: string;
      bio: string | null;
      location: string | null;
      avatar_url: string | null;
      linkedin_url: string | null;
      twitter_url: string | null;
      website_url: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM founder_profiles WHERE id = ${req.id}
    `;

    if (!profile) {
      throw APIError.notFound("founder profile not found");
    }

    // Get startup information
    const startup = await profileDB.queryRow<{
      id: number;
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
    }>`
      SELECT * FROM startups WHERE founder_id = ${profile.id}
    `;

    return {
      id: profile.id,
      userId: profile.user_id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      bio: profile.bio || undefined,
      location: profile.location || undefined,
      avatarUrl: profile.avatar_url || undefined,
      linkedinUrl: profile.linkedin_url || undefined,
      twitterUrl: profile.twitter_url || undefined,
      websiteUrl: profile.website_url || undefined,
      startup: startup ? {
        id: startup.id,
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
      } : undefined,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  }
);
