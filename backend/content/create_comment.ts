import { api, APIError } from "encore.dev/api";
import { contentDB } from "./db";

export interface CreateCommentRequest {
  postId: number;
  authorId: number;
  parentId?: number;
  content: string;
}

export interface CommentResponse {
  id: number;
  postId: number;
  authorId: number;
  parentId?: number;
  content: string;
  likeCount: number;
  createdAt: Date;
}

// Creates a new comment on a post.
export const createComment = api<CreateCommentRequest, CommentResponse>(
  { expose: true, method: "POST", path: "/content/comments" },
  async (req) => {
    if (!req.content || req.content.trim().length === 0) {
      throw APIError.invalidArgument("content is required");
    }

    if (req.content.length > 2000) {
      throw APIError.invalidArgument("comment must be less than 2,000 characters");
    }

    // Verify post exists
    const post = await contentDB.queryRow`
      SELECT id FROM posts WHERE id = ${req.postId}
    `;

    if (!post) {
      throw APIError.notFound("post not found");
    }

    // Verify parent comment exists if specified
    if (req.parentId) {
      const parentComment = await contentDB.queryRow`
        SELECT id FROM comments WHERE id = ${req.parentId} AND post_id = ${req.postId}
      `;

      if (!parentComment) {
        throw APIError.notFound("parent comment not found");
      }
    }

    // Create comment
    const comment = await contentDB.queryRow<{
      id: number;
      post_id: number;
      author_id: number;
      parent_id: number | null;
      content: string;
      like_count: number;
      created_at: Date;
    }>`
      INSERT INTO comments (post_id, author_id, parent_id, content)
      VALUES (${req.postId}, ${req.authorId}, ${req.parentId || null}, ${req.content})
      RETURNING *
    `;

    if (!comment) {
      throw APIError.internal("failed to create comment");
    }

    // Update post comment count
    await contentDB.exec`
      UPDATE posts SET comment_count = comment_count + 1 WHERE id = ${req.postId}
    `;

    return {
      id: comment.id,
      postId: comment.post_id,
      authorId: comment.author_id,
      parentId: comment.parent_id || undefined,
      content: comment.content,
      likeCount: comment.like_count,
      createdAt: comment.created_at,
    };
  }
);
