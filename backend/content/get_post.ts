import { api, APIError } from "encore.dev/api";
import { contentDB } from "./db";

export interface GetPostRequest {
  id: number;
}

export interface PostWithComments {
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
  comments: Comment[];
}

export interface Comment {
  id: number;
  authorId: number;
  parentId?: number;
  content: string;
  likeCount: number;
  createdAt: Date;
  replies: Comment[];
}

// Retrieves a post with its comments.
export const getPost = api<GetPostRequest, PostWithComments>(
  { expose: true, method: "GET", path: "/content/posts/:id" },
  async (req) => {
    // Increment view count
    await contentDB.exec`
      UPDATE posts SET view_count = view_count + 1 WHERE id = ${req.id}
    `;

    // Get post
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
      SELECT * FROM posts WHERE id = ${req.id}
    `;

    if (!post) {
      throw APIError.notFound("post not found");
    }

    // Get comments
    const comments = await contentDB.queryAll<{
      id: number;
      author_id: number;
      parent_id: number | null;
      content: string;
      like_count: number;
      created_at: Date;
    }>`
      SELECT id, author_id, parent_id, content, like_count, created_at
      FROM comments 
      WHERE post_id = ${req.id}
      ORDER BY created_at ASC
    `;

    // Build comment tree
    const commentMap = new Map<number, Comment>();
    const rootComments: Comment[] = [];

    comments.forEach(comment => {
      const commentObj: Comment = {
        id: comment.id,
        authorId: comment.author_id,
        parentId: comment.parent_id || undefined,
        content: comment.content,
        likeCount: comment.like_count,
        createdAt: comment.created_at,
        replies: [],
      };

      commentMap.set(comment.id, commentObj);

      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(commentObj);
        }
      } else {
        rootComments.push(commentObj);
      }
    });

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
      comments: rootComments,
    };
  }
);
