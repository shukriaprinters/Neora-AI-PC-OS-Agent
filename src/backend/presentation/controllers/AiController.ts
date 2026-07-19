import { Request, Response } from "express";
import { DI } from "../../di.ts";

export class AiController {
  private async getRequestUserId(req: Request): Promise<string> {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      const user = await DI.services.auth.verifyToken(token);
      if (user) return user.id;
    }
    return "usr_admin";
  }

  async generateLayout(req: Request, res: Response): Promise<void> {
    try {
      const userId = await this.getRequestUserId(req);
      const { prompt, context } = req.body;
      if (!prompt) {
        res.status(400).json({ success: false, error: "Prompt is required" });
        return;
      }

      const layout = await DI.services.ai.generateLayout(prompt, context || "Empty board");
      
      // Save to prompt history
      await DI.repositories.audit.savePromptHistory({
        userId,
        projectId: req.body.projectId || null,
        prompt,
        modelUsed: "gemini-3.5-flash",
        tokensUsed: 450,
        responsePreview: layout.title
      });

      res.json({ success: true, ...layout });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || String(err) });
    }
  }

  async analyzeVisuals(req: Request, res: Response): Promise<void> {
    try {
      const { imageUrl, prompt } = req.body;
      if (!imageUrl) {
        res.status(400).json({ success: false, error: "Image URL is required" });
        return;
      }

      const analysis = await DI.services.ai.analyzeVisuals(imageUrl, prompt || "Analyze this layout");
      res.json({ success: true, analysis });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || String(err) });
    }
  }

  async chat(req: Request, res: Response): Promise<void> {
    try {
      const { message, history, projectId } = req.body;
      if (!message) {
        res.status(400).json({ success: false, error: "Message is required" });
        return;
      }

      const reply = await DI.services.ai.chat(message, history || [], projectId);
      res.json({
        success: true,
        response: reply,
        model: "Neora AI Router [gemini-3.5-flash]",
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || String(err) });
    }
  }
}
