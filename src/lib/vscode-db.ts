export interface VSCodeFile {
  id: string;
  path: string;
  content: string;
  language: string;
  createdAt: number;
  updatedAt: number;
}

export interface VSCodeExtension {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  installedAt: number;
}

export interface VSCodeCommand {
  id: string;
  command: string;
  timestamp: number;
}

type DBType = IDBDatabase & { close: () => void };

export class VSCodeDB {
  private static db: DBType | null = null;
  private static readonly DB_NAME = 'VSCodeCloneDB';
  private static readonly DB_VERSION = 1;

  static async init(): Promise<void> {
    if (this.db) return;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result as DBType;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('extensions')) {
          db.createObjectStore('extensions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('commandHistory')) {
          db.createObjectStore('commandHistory', { keyPath: 'id' });
        }
      };
    });
  }

  static async getDB(): Promise<DBType> {
    if (!this.db) await this.init();
    return this.db!;
  }

  static async saveFile(file: VSCodeFile): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      store.put({ ...file, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  static async getFile(path: string): Promise<VSCodeFile | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const index = store.index('path') || store;
      const request = store.getAll();
      request.onsuccess = () => {
        const files = request.result as VSCodeFile[];
        resolve(files.find(f => f.path === path) || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  static async getAllFiles(): Promise<VSCodeFile[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as VSCodeFile[]);
      request.onerror = () => reject(request.error);
    });
  }

  static async deleteFile(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  static async saveExtension(ext: VSCodeExtension): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('extensions', 'readwrite');
      const store = tx.objectStore('extensions');
      store.put(ext);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  static async getAllExtensions(): Promise<VSCodeExtension[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('extensions', 'readonly');
      const store = tx.objectStore('extensions');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as VSCodeExtension[]);
      request.onerror = () => reject(request.error);
    });
  }

  static async addCommand(command: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('commandHistory', 'readwrite');
      const store = tx.objectStore('commandHistory');
      const entry: VSCodeCommand = {
        id: crypto.randomUUID(),
        command,
        timestamp: Date.now()
      };
      store.add(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  static async getCommandHistory(): Promise<VSCodeCommand[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('commandHistory', 'readonly');
      const store = tx.objectStore('commandHistory');
      const request = store.getAll();
      request.onsuccess = () => {
        const commands = request.result as VSCodeCommand[];
        resolve(commands.sort((a, b) => b.timestamp - a.timestamp));
      };
      request.onerror = () => reject(request.error);
    });
  }

  static async clearCommandHistory(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('commandHistory', 'readwrite');
      const store = tx.objectStore('commandHistory');
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}