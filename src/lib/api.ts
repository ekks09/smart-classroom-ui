import { AuthResponse, Lecture, HealthStatus, AskRequest, AskResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  },

  async getLectures(token: string): Promise<Lecture[]> {
    const response = await fetch(`${API_URL}/api/lectures`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lectures');
    }

    const data = await response.json();
    return data.lectures;
  },

  async askQuestion(token: string, request: AskRequest): Promise<AskResponse> {
    const response = await fetch(`${API_URL}/api/assistant/ask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to get answer');
    }

    return response.json();
  },

  async getHealth(): Promise<HealthStatus> {
    const response = await fetch(`${API_URL}/api/health`);

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  },
};