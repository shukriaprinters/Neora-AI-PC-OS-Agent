import { IProjectService } from "../../domain/services.ts";
import { IProjectRepository, ILayerRepository } from "../../domain/repositories.ts";
import { Project, Page, Layer } from "../../domain/entities.ts";

export class ProjectService implements IProjectService {
  constructor(
    private projectRepo: IProjectRepository,
    private layerRepo: ILayerRepository
  ) {}

  async createProject(userId: string, name: string, description = "", width = 800, height = 800): Promise<{ project: Project; page: Page; layers: Layer[] }> {
    const project = await this.projectRepo.createProject({
      name,
      description,
      userId,
      width,
      height
    });

    const page = await this.projectRepo.createPage({
      projectId: project.id,
      pageNumber: 1,
      title: "Main Canvas",
      backgroundType: "color",
      backgroundValue: "#0f172a"
    });

    const defaultHeading = await this.layerRepo.createLayer({
      pageId: page.id,
      projectId: project.id,
      name: "Header Node",
      type: "text",
      parentId: null,
      x: 20,
      y: 20,
      width: 60,
      height: 10,
      opacity: 1,
      blendMode: "normal",
      visibility: true,
      locked: false,
      content: "Welcome to Neora Studio",
      fontSize: 32,
      fontFamily: "Space Grotesk",
      color: "#ffffff",
      fontWeight: "bold",
      align: "center"
    });

    return { project, page, layers: [defaultHeading] };
  }

  async getProject(userId: string, projectId: string): Promise<{ project: Project; pages: Page[]; layers: Layer[] }> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error("Project not found");
    
    // In multi-tenant environments, verify project ownership:
    if (project.userId !== userId && userId !== "usr_admin") {
      throw new Error("Access denied to this project");
    }

    const pages = await this.projectRepo.findPagesByProjectId(projectId);
    const layers = await this.layerRepo.listByProjectId(projectId);

    return { project, pages, layers };
  }

  async listUserProjects(userId: string): Promise<Project[]> {
    return this.projectRepo.listByUserId(userId);
  }

  async saveProjectState(
    userId: string,
    projectId: string,
    name: string,
    description: string,
    width: number,
    height: number,
    layers: Layer[],
    backgroundType: "color" | "gradient" | "image",
    backgroundValue: string
  ): Promise<Project> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error("Project not found");
    if (project.userId !== userId && userId !== "usr_admin") {
      throw new Error("Access denied");
    }

    // Update Project metadata
    const updatedProject = await this.projectRepo.updateProject(projectId, {
      name,
      description,
      width,
      height
    });

    // Update Pages background
    const pages = await this.projectRepo.findPagesByProjectId(projectId);
    if (pages.length > 0) {
      await this.projectRepo.updatePage(pages[0].id, {
        backgroundType,
        backgroundValue
      });
    }

    // Save batch layer state
    await this.layerRepo.saveLayersBatch(projectId, layers);

    return updatedProject;
  }
}
