import { AuthResponse, Lecture, HealthStatus, AskRequest, AskResponse, UploadLectureRequest, User } from '@/types';
import { config } from './config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || config.api.baseUrl;

/**
 * Enhanced API error handler
 */
class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Helper to parse error responses from backend
 */
const parseError = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return data.detail || data.message || `Error ${response.status}`;
  } catch {
    return `Error ${response.status}: ${response.statusText}`;
  }
};

/**
 * Main API client with integrated error handling and retry logic
 */
export const api = {
  async ask(question: string, token?: string | null): Promise<{ answer: any }> {
    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const error = await parseError(response);
        throw new APIError(error, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Failed to ask question');
    }
  },

  async generateSemester(subject: string, weeks: number = 12, token?: string | null): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/generate-semester`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, weeks }),
      });

      if (!response.ok) {
        const error = await parseError(response);
        throw new APIError(error, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Failed to generate semester plan');
    }
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await parseError(response);
        throw new APIError(error, response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Login failed: Unable to connect to backend');
    }
  },

  async register(username: string, password: string, email?: string, role: string = 'teacher'): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, role }),
      });

      if (!response.ok) {
        const error = await parseError(response);
        throw new APIError(error, response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Registration failed: Unable to connect to backend');
    }
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_URL}/api/auth/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await parseError(response);
        throw new APIError(error, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Unable to submit password reset request');
    }
  },

  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new APIError('Token expired or invalid', 401);
        }
        const error = await parseError(response);
        throw new APIError(error, response.status);
      }

      const data = await response.json();
      return data.user || data;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Failed to get user info');
    }
  },

  async getLectures(token: string): Promise<Lecture[]> {
    try {
      const response = await fetch(`${API_URL}/api/lectures`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await parseError(response);
        throw new APIError(error, response.status);
      }

      const data = await response.json();
      return (data.lectures || data) as Lecture[];
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Failed to fetch lectures');
    }
  },

  async uploadLecture(token: string, request: UploadLectureRequest): Promise<Lecture> {
    try {
      const response = await fetch(`${API_URL}/api/lectures/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await parseError(response);
        throw new APIError(error, response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Failed to upload lecture');
    }
  },

  async uploadLectureFile(token: string, file: File, title: string, course: string = 'General'): Promise<Lecture> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('course', course);

      const response = await fetch(`${API_URL}/api/lectures/upload-file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await parseError(response);
        throw new APIError(error, response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Failed to upload file');
    }
  },

  async askQuestion(token: string, request: AskRequest): Promise<AskResponse> {
    try {
      // Preferred: new backend contract (/ask)
      const tryNew = async () => {
        const response = await fetch(`${API_URL}/ask`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: request.question }),
        });

        if (!response.ok) {
          const error = await parseError(response);
          throw new APIError(error, response.status);
        }

        const data = await response.json();
        const answer = data?.answer ?? data;
        return {
          answer: typeof answer === 'string' ? answer : JSON.stringify(answer),
          sources: data?.sources || [],
          context_used: data?.context_used || 0,
          retrieval_method: data?.retrieval_method || 'rag',
        } satisfies AskResponse;
      };

      // Fallback: legacy contract (/api/assistant/ask)
      const tryLegacy = async () => {
        const response = await fetch(`${API_URL}/api/assistant/ask`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const error = await parseError(response);
          throw new APIError(error, response.status);
        }

        return (await response.json()) as AskResponse;
      };

      try {
        return await tryNew();
      } catch (error) {
        // If the new endpoint doesn't exist, fall back to legacy.
        if (error instanceof APIError && error.status === 404) {
          return await tryLegacy();
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Failed to get response from AI assistant');
    }
  },

  async getHealth(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${API_URL}/api/health`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new APIError('Health check failed', response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof APIError) throw error;
      // Return default offline status instead of throwing
      return {
        status: 'offline',
        server: 'unknown',
        vector_db: { connected: false, count: 0, embedding_dim: 0 },
      };
    }
  },
};
