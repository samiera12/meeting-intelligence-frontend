export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TranscriptEntry {
  timestamp: string;
  speaker: string;
  text: string;
}

export interface Citation {
  timestamp: string;
}

export interface AnalysisItem {
  text?: string;
  task?: string;
  assignee?: string | null;
  citations: Citation[];
}

export interface Meeting {
  id: string;
  title: string;
  participants: string[];
  meeting_date: string;
  transcript?: TranscriptEntry[];
  created_at: string;
  summary?: AnalysisItem[];
  analysisActionItems?: AnalysisItem[];
  decisions?: AnalysisItem[];
  follow_ups?: AnalysisItem[];
  analyzed_at?: string | null;
}

export type ActionItemStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface ActionItem {
  id: string;
  meeting_id: string | null;
  task: string;
  assignee: string | null;
  status: ActionItemStatus;
  due_date: string | null;
  citations: Citation[];
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}