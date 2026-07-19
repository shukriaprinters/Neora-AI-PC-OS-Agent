import { 
  ACIDJsonRepository, 
  ACIDUserRepository, 
  ACIDProjectRepository, 
  ACIDLayerRepository, 
  ACIDAssetRepository, 
  ACIDTemplateRepository, 
  ACIDExportRepository, 
  ACIDPluginRepository, 
  ACIDAuditRepository, 
  ACIDMemoryRepository 
} from "./infrastructure/database/ACIDJsonRepository.ts";
import { BcryptHasher } from "./infrastructure/security/BcryptHasher.ts";
import { JwtService } from "./infrastructure/security/JwtService.ts";
import { GeminiAdapter } from "./infrastructure/ai/GeminiAdapter.ts";
import { AuthService } from "./application/services/AuthService.ts";
import { ProjectService } from "./application/services/ProjectService.ts";

// Instantiate singletons
const dbStore = new ACIDJsonRepository();
const userRepository = new ACIDUserRepository(dbStore);
const projectRepository = new ACIDProjectRepository(dbStore);
const layerRepository = new ACIDLayerRepository(dbStore);
const assetRepository = new ACIDAssetRepository(dbStore);
const templateRepository = new ACIDTemplateRepository(dbStore);
const exportRepository = new ACIDExportRepository(dbStore);
const pluginRepository = new ACIDPluginRepository(dbStore);
const auditRepository = new ACIDAuditRepository(dbStore);
const memoryRepository = new ACIDMemoryRepository(dbStore);

const bcryptHasher = new BcryptHasher();
const jwtService = new JwtService();
const aiGatewayService = new GeminiAdapter();

const authService = new AuthService(userRepository, bcryptHasher, jwtService);
const projectService = new ProjectService(projectRepository, layerRepository);

export const DI = {
  repositories: {
    db: dbStore,
    user: userRepository,
    project: projectRepository,
    layer: layerRepository,
    asset: assetRepository,
    template: templateRepository,
    export: exportRepository,
    plugin: pluginRepository,
    audit: auditRepository,
    memory: memoryRepository,
  },
  security: {
    hasher: bcryptHasher,
    jwt: jwtService,
  },
  services: {
    auth: authService,
    project: projectService,
    ai: aiGatewayService,
  }
};
