export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Lecture {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  citations?: Citation[];
  timestamp: string;
}

export interface Citation {
  id: string;
  title: string;
  content: string;
  page?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface HealthStatus {
  llm_ready: boolean;
  vector_db: boolean;
}

export interface AskRequest {
  question: string;
  lecture_id?: string;
  mode: 'rag' | 'general';
}

export interface AskResponse {
  answer: string;
  citations?: Citation[];
}