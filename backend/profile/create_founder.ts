import { api, APIError } from "encore.dev/api";
import { profileDB } from "./db";

export interface CreateFounderProfileRequest {
  userId: number;
  firstName: string;
  lastName: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
}

export interface FounderProfile {
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
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new founder profile.
export const createFounderProfile = api<CreateFounderProfileRequest, FounderProfile>(
  { expose: true, method: "POST", path: "/profiles/founder" },
  async (req) => {
    if (!req.firstName || !req.lastName) {
      throw APIError.invalidArgument("firstName and lastName are required");
    }

    // Check if profile already exists
    const existing = await profileDB.queryRow`
      SELECT id FROM founder_profiles WHERE user_id = ${req.userId}
    `;

    if (existing) {
      throw APIError.alreadyExists("founder profile already exists for this user");
    }

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
      INSERT INTO founder_profiles (
        user_id, first_name, last_name, bio, location, 
        avatar_url, linkedin_url, twitter_url, website_url
      )
      VALUES (
        ${req.userId}, ${req.firstName}, ${req.lastName}, ${req.bio || null}, 
        ${req.location || null}, ${req.avatarUrl || null}, ${req.linkedinUrl || null}, 
        ${req.twitterUrl || null}, ${req.websiteUrl || null}
      )
      RETURNING *
    `;

    if (!profile) {
      throw APIError.internal("failed to create founder profile");
    }

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
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  }
);
