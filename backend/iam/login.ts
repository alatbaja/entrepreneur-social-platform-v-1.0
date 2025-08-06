import { api, APIError } from "encore.dev/api";
import { iamDB } from "./db";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
}

// Authenticates a user and returns a JWT token.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    if (!req.email || !req.password) {
      throw APIError.invalidArgument("email and password are required");
    }

    // Find user
    const user = await iamDB.queryRow<{
      id: number;
      email: string;
      username: string;
      password_hash: string;
      role: string;
      is_active: boolean;
    }>`
      SELECT id, email, username, password_hash, role, is_active
      FROM users 
      WHERE email = ${req.email}
    `;

    if (!user || !user.is_active) {
      throw APIError.unauthenticated("invalid credentials");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(req.password, user.password_hash);
    if (!isValidPassword) {
      throw APIError.unauthenticated("invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      "your-secret-key", // In production, use a proper secret from config
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }
);
