import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { bookingDB } from "./db";

export interface ListBookingsRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  founderId?: Query<number>;
  expertId?: Query<number>;
  status?: Query<string>;
}

export interface BookingSummary {
  id: number;
  officeHoursId: number;
  founderId: number;
  expertId: number;
  status: string;
  meetingUrl?: string;
  notes?: string;
  scheduledAt: Date;
  createdAt: Date;
  officeHoursTitle: string;
  durationMinutes: number;
}

export interface ListBookingsResponse {
  bookings: BookingSummary[];
  total: number;
}

// Retrieves a list of bookings with pagination and filtering.
export const listBookings = api<ListBookingsRequest, ListBookingsResponse>(
  { expose: true, method: "GET", path: "/booking/bookings" },
  async (req) => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.founderId) {
      whereClause += ` AND b.founder_id = $${paramIndex}`;
      params.push(req.founderId);
      paramIndex++;
    }

    if (req.expertId) {
      whereClause += ` AND b.expert_id = $${paramIndex}`;
      params.push(req.expertId);
      paramIndex++;
    }

    if (req.status) {
      whereClause += ` AND b.status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    // Get total count
    const countResult = await bookingDB.rawQueryRow<{ count: number }>(
      `SELECT COUNT(*) as count FROM bookings b ${whereClause}`,
      ...params
    );

    const total = countResult?.count || 0;

    // Get bookings with office hours info
    const bookings = await bookingDB.rawQueryAll<{
      id: number;
      office_hours_id: number;
      founder_id: number;
      expert_id: number;
      status: string;
      meeting_url: string | null;
      notes: string | null;
      scheduled_at: Date;
      created_at: Date;
      office_hours_title: string;
      duration_minutes: number;
    }>(
      `SELECT 
         b.id, b.office_hours_id, b.founder_id, b.expert_id, b.status,
         b.meeting_url, b.notes, b.scheduled_at, b.created_at,
         oh.title as office_hours_title, oh.duration_minutes
       FROM bookings b
       JOIN office_hours oh ON b.office_hours_id = oh.id
       ${whereClause}
       ORDER BY b.scheduled_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      ...params,
      limit,
      offset
    );

    return {
      bookings: bookings.map(booking => ({
        id: booking.id,
        officeHoursId: booking.office_hours_id,
        founderId: booking.founder_id,
        expertId: booking.expert_id,
        status: booking.status,
        meetingUrl: booking.meeting_url || undefined,
        notes: booking.notes || undefined,
        scheduledAt: booking.scheduled_at,
        createdAt: booking.created_at,
        officeHoursTitle: booking.office_hours_title,
        durationMinutes: booking.duration_minutes,
      })),
      total,
    };
  }
);
