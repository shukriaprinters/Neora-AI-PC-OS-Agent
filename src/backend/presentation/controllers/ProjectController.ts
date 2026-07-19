import { Request, Response } from "express";
import { DI } from "../../di.ts";

export class ProjectController {
  private async getRequestUserId(req: Request): Promise<string> {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      const user = await DI.services.auth.verifyToken(token);
      if (user) return user.id;
    }
    return "usr_admin"; // Default sandbox user
  }

  async listProjects(req: Request, res: Response): Promise<void> {
    try {
      const userId = await this.getRequestUserId(req);
      const projects = await DI.services.project.listUserProjects(userId);
      res.json({ success: true, projects });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || String(err) });
    }
  }

  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = await this.getRequestUserId(req);
      const { name, description, width, height } = req.body;
      if (!name) {
        res.status(400).json({ success: false, error: "Project name is required" });
        return;
      }

      const result = await DI.services.project.createProject(userId, name, description, Number(width), Number(height));
      
      await DI.repositories.audit.log({
        userId,
        action: "PROJECT_CREATE",
        resource: "Project",
        resourceId: result.project.id,
        details: `Created project canvas: ${result.project.name}`,
        ipAddress: req.ip || "127.0.0.1"
      });

      res.status(201).json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || String(err) });
    }
  }

  async openProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = await this.getRequestUserId(req);
      const { projectId } = req.body;
      if (!projectId) {
        res.status(400).json({ success: false, error: "Project ID is required" });
        return;
      }

      const result = await DI.services.project.getProject(userId, projectId);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message || String(err) });
    }
  }

  async saveProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = await this.getRequestUserId(req);
      const { projectId, name, description, width, height, layers, backgroundType, backgroundValue } = req.body;
      if (!projectId) {
        res.status(400).json({ success: false, error: "Project ID is required" });
        return;
      }

      const project = await DI.services.project.saveProjectState(
        userId,
        projectId,
        name,
        description,
        Number(width),
        Number(height),
        layers || [],
        backgroundType || "color",
        backgroundValue || "#0f172a"
      );

      res.json({ success: true, project });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || String(err) });
    }
  }

  async createPage(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, title } = req.body;
      if (!projectId) {
        res.status(400).json({ success: false, error: "Project ID is required" });
        return;
      }

      const pages = await DI.repositories.project.findPagesByProjectId(projectId);
      const newPage = await DI.repositories.project.createPage({
        projectId,
        pageNumber: pages.length + 1,
        title: title || `Page ${pages.length + 1}`,
        backgroundType: "color",
        backgroundValue: "#ffffff"
      });

      res.status(201).json({ success: true, page: newPage });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || String(err) });
    }
  }

  async listAssets(req: Request, res: Response): Promise<void> {
    try {
      const assets = await DI.repositories.asset.listAll();
      res.json({ success: true, assets });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || String(err) });
    }
  }

  async listTemplates(req: Request, res: Response): Promise<void> {
    try {
      const templates = await DI.repositories.template.listAll();
      res.json({ success: true, templates });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || String(err) });
    }
  }

  async listPlugins(req: Request, res: Response): Promise<void> {
    try {
      const plugins = await DI.repositories.plugin.listAll();
      res.json({ success: true, plugins });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || String(err) });
    }
  }
}
