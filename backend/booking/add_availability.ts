import { api, APIError } from "encore.dev/api";
import { bookingDB } from "./db";

export interface AddAvailabilityRequest {
  officeHoursId: number;
  startTime: Date;
  endTime: Date;
}

export interface AvailabilitySlot {
  id: number;
  officeHoursId: number;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  createdAt: Date;
}

// Adds an availability slot for office hours.
export const addAvailability = api<AddAvailabilityRequest, AvailabilitySlot>(
  { expose: true, method: "POST", path: "/booking/availability" },
  async (req) => {
    if (req.startTime >= req.endTime) {
      throw APIError.invalidArgument("start time must be before end time");
    }

    if (req.startTime < new Date()) {
      throw APIError.invalidArgument("start time must be in the future");
    }

    // Verify office hours exists
    const officeHours = await bookingDB.queryRow`
      SELECT id FROM office_hours WHERE id = ${req.officeHoursId}
    `;

    if (!officeHours) {
      throw APIError.notFound("office hours not found");
    }

    // Check for overlapping slots
    const overlapping = await bookingDB.queryRow`
      SELECT id FROM availability_slots 
      WHERE office_hours_id = ${req.officeHoursId}
        AND (
          (start_time <= ${req.startTime} AND end_time > ${req.startTime})
          OR (start_time < ${req.endTime} AND end_time >= ${req.endTime})
          OR (start_time >= ${req.startTime} AND end_time <= ${req.endTime})
        )
    `;

    if (overlapping) {
      throw APIError.alreadyExists("overlapping availability slot already exists");
    }

    const slot = await bookingDB.queryRow<{
      id: number;
      office_hours_id: number;
      start_time: Date;
      end_time: Date;
      is_available: boolean;
      created_at: Date;
    }>`
      INSERT INTO availability_slots (office_hours_id, start_time, end_time)
      VALUES (${req.officeHoursId}, ${req.startTime}, ${req.endTime})
      RETURNING *
    `;

    if (!slot) {
      throw APIError.internal("failed to create availability slot");
    }

    return {
      id: slot.id,
      officeHoursId: slot.office_hours_id,
      startTime: slot.start_time,
      endTime: slot.end_time,
      isAvailable: slot.is_available,
      createdAt: slot.created_at,
    };
  }
);
