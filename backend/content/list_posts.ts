import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { contentDB } from "./db";

export interface ListPostsRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  authorId?: Query<number>;
  tags?: Query<string>;
}

export interface PostSummary {
  id: number;
  authorId: number;
  title?: string;
  content: string;
  contentType: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
}

export interface ListPostsResponse {
  posts: PostSummary[];
  total: number;
}

// Retrieves a list of posts with pagination and filtering.
export const listPosts = api<ListPostsRequest, ListPostsResponse>(
  { expose: true, method: "GET", path: "/content/posts" },
  async (req) => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;

    let whereClause = "WHERE is_published = true";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.authorId) {
      whereClause += ` AND author_id = $${paramIndex}`;
      params.push(req.authorId);
      paramIndex++;
    }

    if (req.tags) {
      whereClause += ` AND $${paramIndex} = ANY(tags)`;
      params.push(req.tags);
      paramIndex++;
    }

    // Get total count
    const countResult = await contentDB.rawQueryRow<{ count: number }>(
      `SELECT COUNT(*) as count FROM posts ${whereClause}`,
      ...params
    );

    const total = countResult?.count || 0;

    // Get posts
    const posts = await contentDB.rawQueryAll<{
      id: number;
      author_id: number;
      title: string | null;
      content: string;
      content_type: string;
      tags: string[];
      view_count: number;
      like_count: number;
      comment_count: number;
      created_at: Date;
    }>(
      `SELECT id, author_id, title, content, content_type, tags, view_count, like_count, comment_count, created_at
       FROM posts ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      ...params,
      limit,
      offset
    );

    return {
      posts: posts.map(post => ({
        id: post.id,
        authorId: post.author_id,
        title: post.title || undefined,
        content: post.content,
        contentType: post.content_type,
        tags: post.tags,
        viewCount: post.view_count,
        likeCount: post.like_count,
        commentCount: post.comment_count,
        createdAt: post.created_at,
      })),
      total,
    };
  }
);
