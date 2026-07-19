import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "neora_core_designer_os_secret_token_seed_2026_foundation";

export class JwtService {
  sign(payload: { userId: string; email: string; role: string }, expiresIn = "7d"): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
  }

  verify(token: string): { userId: string; email: string; role: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return null;
    }
  }
}
