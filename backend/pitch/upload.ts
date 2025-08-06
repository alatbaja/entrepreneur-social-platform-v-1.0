import { api, APIError } from "encore.dev/api";
import { pitchDB } from "./db";
import { pitchBucket } from "./storage";

export interface UploadPitchDeckRequest {
  founderId: number;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface UploadPitchDeckResponse {
  pitchDeckId: number;
  uploadUrl: string;
}

// Initiates a pitch deck upload and returns a signed upload URL.
export const uploadPitchDeck = api<UploadPitchDeckRequest, UploadPitchDeckResponse>(
  { expose: true, method: "POST", path: "/pitch/upload" },
  async (req) => {
    if (!req.title || req.title.trim().length === 0) {
      throw APIError.invalidArgument("title is required");
    }

    if (!req.fileName || !req.fileType) {
      throw APIError.invalidArgument("fileName and fileType are required");
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
    if (!allowedTypes.includes(req.fileType)) {
      throw APIError.invalidArgument("only PDF and PowerPoint files are allowed");
    }

    // Validate file size (max 50MB)
    if (req.fileSize > 50 * 1024 * 1024) {
      throw APIError.invalidArgument("file size must be less than 50MB");
    }

    // Create pitch deck record
    const pitchDeck = await pitchDB.queryRow<{
      id: number;
      founder_id: number;
      title: string;
      description: string | null;
      file_name: string;
      file_size: number;
      file_type: string;
      status: string;
      created_at: Date;
    }>`
      INSERT INTO pitch_decks (founder_id, title, description, file_url, file_name, file_size, file_type)
      VALUES (
        ${req.founderId}, 
        ${req.title}, 
        ${req.description || null}, 
        '', 
        ${req.fileName}, 
        ${req.fileSize}, 
        ${req.fileType}
      )
      RETURNING *
    `;

    if (!pitchDeck) {
      throw APIError.internal("failed to create pitch deck record");
    }

    // Generate object key
    const objectKey = `pitch-decks/${pitchDeck.id}/${req.fileName}`;

    // Generate signed upload URL
    const { url } = await pitchBucket.signedUploadUrl(objectKey, {
      ttl: 3600, // 1 hour
    });

    // Update file URL in database
    await pitchDB.exec`
      UPDATE pitch_decks SET file_url = ${objectKey} WHERE id = ${pitchDeck.id}
    `;

    return {
      pitchDeckId: pitchDeck.id,
      uploadUrl: url,
    };
  }
);
