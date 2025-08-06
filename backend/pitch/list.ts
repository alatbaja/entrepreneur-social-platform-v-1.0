import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { pitchDB } from "./db";

export interface ListPitchDecksRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  founderId?: Query<number>;
  status?: Query<string>;
}

export interface PitchDeckSummary {
  id: number;
  founderId: number;
  title: string;
  description?: string;
  fileName: string;
  fileType: string;
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  slideCount: number;
  createdAt: Date;
}

export interface ListPitchDecksResponse {
  pitchDecks: PitchDeckSummary[];
  total: number;
}

// Retrieves a list of pitch decks with pagination and filtering.
export const listPitchDecks = api<ListPitchDecksRequest, ListPitchDecksResponse>(
  { expose: true, method: "GET", path: "/pitch/decks" },
  async (req) => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.founderId) {
      whereClause += ` AND founder_id = $${paramIndex}`;
      params.push(req.founderId);
      paramIndex++;
    }

    if (req.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    // Get total count
    const countResult = await pitchDB.rawQueryRow<{ count: number }>(
      `SELECT COUNT(*) as count FROM pitch_decks ${whereClause}`,
      ...params
    );

    const total = countResult?.count || 0;

    // Get pitch decks with slide count
    const pitchDecks = await pitchDB.rawQueryAll<{
      id: number;
      founder_id: number;
      title: string;
      description: string | null;
      file_name: string;
      file_type: string;
      status: string;
      view_count: number;
      like_count: number;
      comment_count: number;
      slide_count: number;
      created_at: Date;
    }>(
      `SELECT 
         pd.id, pd.founder_id, pd.title, pd.description, pd.file_name, pd.file_type,
         pd.status, pd.view_count, pd.like_count, pd.comment_count, pd.created_at,
         COALESCE(slide_counts.slide_count, 0) as slide_count
       FROM pitch_decks pd
       LEFT JOIN (
         SELECT pitch_deck_id, COUNT(*) as slide_count 
         FROM pitch_slides 
         GROUP BY pitch_deck_id
       ) slide_counts ON pd.id = slide_counts.pitch_deck_id
       ${whereClause}
       ORDER BY pd.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      ...params,
      limit,
      offset
    );

    return {
      pitchDecks: pitchDecks.map(deck => ({
        id: deck.id,
        founderId: deck.founder_id,
        title: deck.title,
        description: deck.description || undefined,
        fileName: deck.file_name,
        fileType: deck.file_type,
        status: deck.status,
        viewCount: deck.view_count,
        likeCount: deck.like_count,
        commentCount: deck.comment_count,
        slideCount: deck.slide_count,
        createdAt: deck.created_at,
      })),
      total,
    };
  }
);
