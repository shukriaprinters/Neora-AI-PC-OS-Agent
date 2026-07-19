export interface ArchitectSection {
  id: string;
  number: number;
  title: string;
  description: string;
  tags: string[];
  content: string;
  iconName: string;
}

export interface MetricItem {
  label: string;
  value: string | number;
  description: string;
  iconName: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueAt: string;
  completed: boolean;
  tags?: string[];
  completedAt?: string;
  archived?: boolean;
  reminderAt?: string;
  category?: string;
  createdAt?: string;
  attachment?: string;
  subTasks?: SubTask[];
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface Reminder {
  id: string;
  title: string;
  remindAt: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags?: string[];
}

export interface Memory {
  id: string;
  key: string;
  value: string;
  category: 'personal' | 'work' | 'preference' | 'skill';
  importance: number;
  tags?: string[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  receiverName: string;
  receiverEmail: string;
  receiverAddress: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate: number;
  notes: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  classification?: 'chat' | 'os-command' | 'rejected';
  brainUsed?: 'gemini' | 'groq' | 'ollama' | 'offline';
  image?: {
    data: string;
    mimeType: string;
  };
}

export interface PlanStep {
  id: string;
  kind: 'shell' | 'file_write' | 'code_edit' | 'verify' | 'note' | 'tool_call';
  title: string;
  payload: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  feedback?: string;
}

export interface Plan {
  id: string;
  goal: string;
  steps: PlanStep[];
  status: 'pending' | 'running' | 'completed' | 'failed';
}
