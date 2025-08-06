import { api, APIError } from "encore.dev/api";
import { contentDB } from "./db";

export interface CreatePostRequest {
  authorId: number;
  title?: string;
  content: string;
  contentType?: "text" | "markdown";
  tags?: string[];
}

export interface Post {
  id: number;
  authorId: number;
  title?: string;
  content: string;
  contentType: string;
  tags: string[];
  isPublished: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new post.
export const createPost = api<CreatePostRequest, Post>(
  { expose: true, method: "POST", path: "/content/posts" },
  async (req) => {
    if (!req.content || req.content.trim().length === 0) {
      throw APIError.invalidArgument("content is required");
    }

    if (req.content.length > 10000) {
      throw APIError.invalidArgument("content must be less than 10,000 characters");
    }

    const post = await contentDB.queryRow<{
      id: number;
      author_id: number;
      title: string | null;
      content: string;
      content_type: string;
      tags: string[];
      is_published: boolean;
      view_count: number;
      like_count: number;
      comment_count: number;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO posts (author_id, title, content, content_type, tags)
      VALUES (
        ${req.authorId}, 
        ${req.title || null}, 
        ${req.content}, 
        ${req.contentType || "text"}, 
        ${req.tags || []}
      )
      RETURNING *
    `;

    if (!post) {
      throw APIError.internal("failed to create post");
    }

    return {
      id: post.id,
      authorId: post.author_id,
      title: post.title || undefined,
      content: post.content,
      contentType: post.content_type,
      tags: post.tags,
      isPublished: post.is_published,
      viewCount: post.view_count,
      likeCount: post.like_count,
      commentCount: post.comment_count,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
    };
  }
);
