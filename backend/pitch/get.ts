import { api, APIError } from "encore.dev/api";
import { pitchDB } from "./db";
import { pitchBucket } from "./storage";

export interface GetPitchDeckRequest {
  id: number;
}

export interface PitchSlide {
  id: number;
  slideNumber: number;
  imageUrl: string;
  thumbnailUrl?: string;
  textContent?: string;
  comments: SlideComment[];
}

export interface SlideComment {
  id: number;
  authorId: number;
  content: string;
  xPosition?: number;
  yPosition?: number;
  likeCount: number;
  createdAt: Date;
}

export interface PitchDeckDetails {
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
  createdAt: Date;
  updatedAt: Date;
  slides: PitchSlide[];
}

// Retrieves a pitch deck with all its slides and comments.
export const getPitchDeck = api<GetPitchDeckRequest, PitchDeckDetails>(
  { expose: true, method: "GET", path: "/pitch/decks/:id" },
  async (req) => {
    // Increment view count
    await pitchDB.exec`
      UPDATE pitch_decks SET view_count = view_count + 1 WHERE id = ${req.id}
    `;

    // Get pitch deck
    const pitchDeck = await pitchDB.queryRow<{
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
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM pitch_decks WHERE id = ${req.id}
    `;

    if (!pitchDeck) {
      throw APIError.notFound("pitch deck not found");
    }

    // Get slides
    const slides = await pitchDB.queryAll<{
      id: number;
      slide_number: number;
      image_url: string;
      thumbnail_url: string | null;
      text_content: string | null;
    }>`
      SELECT id, slide_number, image_url, thumbnail_url, text_content
      FROM pitch_slides 
      WHERE pitch_deck_id = ${req.id}
      ORDER BY slide_number ASC
    `;

    // Get comments for all slides
    const comments = await pitchDB.queryAll<{
      id: number;
      slide_id: number;
      author_id: number;
      content: string;
      x_position: number | null;
      y_position: number | null;
      like_count: number;
      created_at: Date;
    }>`
      SELECT id, slide_id, author_id, content, x_position, y_position, like_count, created_at
      FROM pitch_comments 
      WHERE pitch_deck_id = ${req.id}
      ORDER BY created_at ASC
    `;

    // Group comments by slide
    const commentsBySlide = new Map<number, SlideComment[]>();
    comments.forEach(comment => {
      if (!commentsBySlide.has(comment.slide_id)) {
        commentsBySlide.set(comment.slide_id, []);
      }
      commentsBySlide.get(comment.slide_id)!.push({
        id: comment.id,
        authorId: comment.author_id,
        content: comment.content,
        xPosition: comment.x_position || undefined,
        yPosition: comment.y_position || undefined,
        likeCount: comment.like_count,
        createdAt: comment.created_at,
      });
    });

    // Generate signed URLs for slides
    const slidesWithUrls: PitchSlide[] = [];
    for (const slide of slides) {
      const { url: imageUrl } = await pitchBucket.signedDownloadUrl(slide.image_url, { ttl: 3600 });
      let thumbnailUrl: string | undefined;
      
      if (slide.thumbnail_url) {
        const { url } = await pitchBucket.signedDownloadUrl(slide.thumbnail_url, { ttl: 3600 });
        thumbnailUrl = url;
      }

      slidesWithUrls.push({
        id: slide.id,
        slideNumber: slide.slide_number,
        imageUrl,
        thumbnailUrl,
        textContent: slide.text_content || undefined,
        comments: commentsBySlide.get(slide.id) || [],
      });
    }

    return {
      id: pitchDeck.id,
      founderId: pitchDeck.founder_id,
      title: pitchDeck.title,
      description: pitchDeck.description || undefined,
      fileName: pitchDeck.file_name,
      fileType: pitchDeck.file_type,
      status: pitchDeck.status,
      viewCount: pitchDeck.view_count,
      likeCount: pitchDeck.like_count,
      commentCount: pitchDeck.comment_count,
      createdAt: pitchDeck.created_at,
      updatedAt: pitchDeck.updated_at,
      slides: slidesWithUrls,
    };
  }
);
