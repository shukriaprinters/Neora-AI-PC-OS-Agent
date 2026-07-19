import { Request, Response } from "express";
import { DI } from "../../di.ts";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        res.status(400).json({ success: false, error: "Email, password, and name are required." });
        return;
      }

      const result = await DI.services.auth.register(email, password, name);
      
      // Log audit trail
      await DI.repositories.audit.log({
        userId: result.user.id,
        action: "USER_REGISTER",
        resource: "User",
        resourceId: result.user.id,
        details: `Successfully registered designer: ${result.user.email}`,
        ipAddress: req.ip || "127.0.0.1"
      });

      res.status(201).json({ success: true, ...result });
    } catch (err: any) {
      console.error("Registration error:", err);
      res.status(400).json({ success: false, error: err.message || String(err) });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, error: "Email and password are required." });
        return;
      }

      const result = await DI.services.auth.login(email, password);

      // Log audit trail
      await DI.repositories.audit.log({
        userId: result.user.id,
        action: "USER_LOGIN",
        resource: "User",
        resourceId: result.user.id,
        details: `Successfully logged in designer: ${result.user.email}`,
        ipAddress: req.ip || "127.0.0.1"
      });

      res.status(200).json({ success: true, ...result });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(401).json({ success: false, error: err.message || String(err) });
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "Unauthorized access token" });
      return;
    }

    const token = authHeader.split("Bearer ")[1];
    const user = await DI.services.auth.verifyToken(token);
    if (!user) {
      res.status(401).json({ success: false, error: "Session expired or invalid" });
      return;
    }

    res.json({ success: true, user });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      await DI.services.auth.logout(token);
    }
    res.json({ success: true, message: "Logged out successfully" });
  }
}
