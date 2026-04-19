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
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  sources?: Source[];
  timestamp: string;
}

export interface Source {
  lecture_title: string;
  chunk_idx: number;
  content?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface HealthStatus {
  llm_ready: boolean;
  vector_db: {
    connected: boolean;
  };
  stt_ready: boolean;
}

export interface AskRequest {
  question: string;
  lecture_id?: string;
  mode: 'rag' | 'general';
}

export interface AskResponse {
  answer: string;
  sources?: Source[];
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
  started_by: string;
}