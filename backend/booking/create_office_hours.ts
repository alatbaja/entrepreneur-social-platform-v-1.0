import { api, APIError } from "encore.dev/api";
import { bookingDB } from "./db";

export interface CreateOfficeHoursRequest {
  expertId: number;
  title: string;
  description?: string;
  durationMinutes?: number;
  priceCents?: number;
  timezone?: string;
}

export interface OfficeHours {
  id: number;
  expertId: number;
  title: string;
  description?: string;
  durationMinutes: number;
  priceCents: number;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new office hours offering.
export const createOfficeHours = api<CreateOfficeHoursRequest, OfficeHours>(
  { expose: true, method: "POST", path: "/booking/office-hours" },
  async (req) => {
    if (!req.title || req.title.trim().length === 0) {
      throw APIError.invalidArgument("title is required");
    }

    if (req.durationMinutes && (req.durationMinutes < 15 || req.durationMinutes > 180)) {
      throw APIError.invalidArgument("duration must be between 15 and 180 minutes");
    }

    const officeHours = await bookingDB.queryRow<{
      id: number;
      expert_id: number;
      title: string;
      description: string | null;
      duration_minutes: number;
      price_cents: number;
      timezone: string;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO office_hours (
        expert_id, title, description, duration_minutes, price_cents, timezone
      )
      VALUES (
        ${req.expertId}, 
        ${req.title}, 
        ${req.description || null}, 
        ${req.durationMinutes || 30}, 
        ${req.priceCents || 0}, 
        ${req.timezone || "UTC"}
      )
      RETURNING *
    `;

    if (!officeHours) {
      throw APIError.internal("failed to create office hours");
    }

    return {
      id: officeHours.id,
      expertId: officeHours.expert_id,
      title: officeHours.title,
      description: officeHours.description || undefined,
      durationMinutes: officeHours.duration_minutes,
      priceCents: officeHours.price_cents,
      timezone: officeHours.timezone,
      isActive: officeHours.is_active,
      createdAt: officeHours.created_at,
      updatedAt: officeHours.updated_at,
    };
  }
);
