export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'teacher' | 'student' | 'admin';
}

export interface Lecture {
  id: string;
  title: string;
  course?: string;
  chunk_count?: number;
  created_at?: string;
  uploaded_at?: string;
  file_type?: string;
  original_filename?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  sources?: Source[];
  timestamp: string;
}

export interface Source {
  lecture_id: string;
  lecture_title: string;
  chunk_idx: number;
  similarity: number;
  preview: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface HealthStatus {
  status?: string;
  server?: string;
  llm_ready?: boolean;
  stt_ready?: boolean;
  vector_db: {
    connected: boolean;
    count?: number;
    embedding_dim?: number;
  };
}

export interface AskRequest {
  question: string;
  lecture_id?: string;
  mode: 'rag' | 'general';
}

export interface AskResponse {
  answer: string;
  sources: Source[];
  context_used: number;
  retrieval_method: string;
}

export interface UploadLectureRequest {
  title: string;
  course?: string;
  content: string;
}

export interface LiveSession {
  session_id: string;
  title: string;
  course: string;
  active?: boolean;
  started_by?: string;
}
