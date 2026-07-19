import { IAuthService } from "../../domain/services.ts";
import { IUserRepository } from "../../domain/repositories.ts";
import { BcryptHasher } from "../../infrastructure/security/BcryptHasher.ts";
import { JwtService } from "../../infrastructure/security/JwtService.ts";
import { User } from "../../domain/entities.ts";

export class AuthService implements IAuthService {
  constructor(
    private userRepo: IUserRepository,
    private hasher: BcryptHasher,
    private jwt: JwtService
  ) {}

  async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await this.hasher.hash(password);
    const user = await this.userRepo.createUser({
      email,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      role: "lead-designer",
      passwordHash
    });

    const token = this.jwt.sign({ userId: user.id, email: user.email, role: user.role });
    await this.userRepo.saveSession({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      deviceInfo: "Neora Designer Client Core"
    });

    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const hash = await this.userRepo.getPasswordHash(user.id);
    if (!hash) {
      throw new Error("Authentication method mismatch");
    }

    const matched = await this.hasher.compare(password, hash);
    if (!matched) {
      throw new Error("Invalid email or password");
    }

    const token = this.jwt.sign({ userId: user.id, email: user.email, role: user.role });
    await this.userRepo.saveSession({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      deviceInfo: "Neora Designer Client Core"
    });

    return { user, token };
  }

  async verifyToken(token: string): Promise<User | null> {
    const session = await this.userRepo.findSessionByToken(token);
    if (!session) return null;

    const payload = this.jwt.verify(token);
    if (!payload) return null;

    return this.userRepo.findById(payload.userId);
  }

  async logout(token: string): Promise<void> {
    await this.userRepo.deleteSession(token);
  }
}
