import { api, APIError } from "encore.dev/api";
import { iamDB } from "./db";
import * as bcrypt from "bcrypt";

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  role?: "member" | "expert" | "investor";
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

// Registers a new user account.
export const register = api<RegisterRequest, User>(
  { expose: true, method: "POST", path: "/auth/register" },
  async (req) => {
    // Validate input
    if (!req.email || !req.username || !req.password) {
      throw APIError.invalidArgument("email, username, and password are required");
    }

    if (req.password.length < 8) {
      throw APIError.invalidArgument("password must be at least 8 characters");
    }

    // Check if user already exists
    const existingUser = await iamDB.queryRow`
      SELECT id FROM users WHERE email = ${req.email} OR username = ${req.username}
    `;

    if (existingUser) {
      throw APIError.alreadyExists("user with this email or username already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(req.password, 12);

    // Create user
    const user = await iamDB.queryRow<{
      id: number;
      email: string;
      username: string;
      role: string;
      is_active: boolean;
      created_at: Date;
    }>`
      INSERT INTO users (email, username, password_hash, role)
      VALUES (${req.email}, ${req.username}, ${passwordHash}, ${req.role || "member"})
      RETURNING id, email, username, role, is_active, created_at
    `;

    if (!user) {
      throw APIError.internal("failed to create user");
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
    };
  }
);
