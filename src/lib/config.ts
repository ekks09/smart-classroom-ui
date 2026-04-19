/**
 * Smart Classroom AI - Integration Configuration
 * 
 * This file centralizes all configuration for backend integration.
 * Update the frontend API URL to match your backend deployment.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const config = {
  // API Configuration
  api: {
    baseUrl: API_URL,
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },

  // Socket.IO Configuration
  socket: {
    url: API_URL,
    path: '/socket.io/',
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  },

  // Audio Configuration
  audio: {
    targetSampleRate: 16000, // Backend expects 16kHz
    bufferSize: 4096,
    mimeType: 'audio/wav',
  },

  // Feature Flags
  features: {
    rag: true,
    liveStreaming: true,
    generalChat: true,
    fileUpload: true,
  },

  // Demo Credentials (for development)
  demo: {
    username: 'teacher',
    password: 'Password123',
  },

  // Student Registration (create new accounts)
  defaultRole: 'student',

  // Cache Configuration
  cache: {
    lecturesTTL: 5 * 60 * 1000, // 5 minutes
    healthTTL: 30 * 1000, // 30 seconds
  },
};

/**
 * Integration Setup Instructions:
 * 
 * LOCAL DEVELOPMENT:
 * 1. Run backend on port 8000 (FastAPI + Socket.IO)
 * 2. Frontend will connect to http://localhost:8000
 * 3. Enable CORS on backend to accept frontend requests
 * 
 * COLAB DEPLOYMENT:
 * 1. Deploy backend on Colab with ngrok tunnel
 * 2. Set NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.app
 * 
 * PRODUCTION DEPLOYMENT:
 * 1. Deploy backend to Railway, Heroku, or custom server
 * 2. Set NEXT_PUBLIC_API_URL to production backend URL
 * 3. Ensure CORS headers allow frontend domain
 * 4. Use HTTPS for both frontend and backend
 */

export default config;
