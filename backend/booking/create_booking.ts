import { api, APIError } from "encore.dev/api";
import { bookingDB } from "./db";

export interface CreateBookingRequest {
  slotId: number;
  founderId: number;
  notes?: string;
}

export interface Booking {
  id: number;
  officeHoursId: number;
  slotId: number;
  founderId: number;
  expertId: number;
  status: string;
  meetingUrl?: string;
  notes?: string;
  founderNotes?: string;
  expertNotes?: string;
  scheduledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new booking for an available slot.
export const createBooking = api<CreateBookingRequest, Booking>(
  { expose: true, method: "POST", path: "/booking/bookings" },
  async (req) => {
    // Get slot and verify it's available
    const slot = await bookingDB.queryRow<{
      id: number;
      office_hours_id: number;
      start_time: Date;
      end_time: Date;
      is_available: boolean;
    }>`
      SELECT id, office_hours_id, start_time, end_time, is_available
      FROM availability_slots 
      WHERE id = ${req.slotId}
    `;

    if (!slot) {
      throw APIError.notFound("availability slot not found");
    }

    if (!slot.is_available) {
      throw APIError.alreadyExists("slot is no longer available");
    }

    if (slot.start_time < new Date()) {
      throw APIError.invalidArgument("cannot book past slots");
    }

    // Get expert ID from office hours
    const officeHours = await bookingDB.queryRow<{
      expert_id: number;
    }>`
      SELECT expert_id FROM office_hours WHERE id = ${slot.office_hours_id}
    `;

    if (!officeHours) {
      throw APIError.notFound("office hours not found");
    }

    // Check if slot is already booked
    const existingBooking = await bookingDB.queryRow`
      SELECT id FROM bookings WHERE slot_id = ${req.slotId} AND status != 'cancelled'
    `;

    if (existingBooking) {
      throw APIError.alreadyExists("slot is already booked");
    }

    // Create booking
    const booking = await bookingDB.queryRow<{
      id: number;
      office_hours_id: number;
      slot_id: number;
      founder_id: number;
      expert_id: number;
      status: string;
      meeting_url: string | null;
      notes: string | null;
      founder_notes: string | null;
      expert_notes: string | null;
      scheduled_at: Date;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO bookings (
        office_hours_id, slot_id, founder_id, expert_id, 
        notes, scheduled_at
      )
      VALUES (
        ${slot.office_hours_id}, ${req.slotId}, ${req.founderId}, 
        ${officeHours.expert_id}, ${req.notes || null}, ${slot.start_time}
      )
      RETURNING *
    `;

    if (!booking) {
      throw APIError.internal("failed to create booking");
    }

    // Mark slot as unavailable
    await bookingDB.exec`
      UPDATE availability_slots SET is_available = false WHERE id = ${req.slotId}
    `;

    return {
      id: booking.id,
      officeHoursId: booking.office_hours_id,
      slotId: booking.slot_id,
      founderId: booking.founder_id,
      expertId: booking.expert_id,
      status: booking.status,
      meetingUrl: booking.meeting_url || undefined,
      notes: booking.notes || undefined,
      founderNotes: booking.founder_notes || undefined,
      expertNotes: booking.expert_notes || undefined,
      scheduledAt: booking.scheduled_at,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
    };
  }
);
