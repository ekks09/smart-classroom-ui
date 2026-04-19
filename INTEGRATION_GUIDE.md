# Smart Classroom AI - Frontend-Backend Integration Guide

## Overview

This document provides step-by-step instructions for integrating the Smart Classroom AI frontend (Next.js) with the FastAPI backend (Colab or local).

---

## 📋 Prerequisites

### Frontend (Already Installed)
- Node.js 16+
- Next.js 14
- React 18
- TypeScript
- Socket.IO Client (v4.8.3)

### Backend (Colab Notebook)
- FastAPI
- Socket.IO (python-socketio)
- Supabase pgvector
- Faster Whisper
- Qwen 2.5-3B LLM
- SQLite

---

## 🚀 Setup Options

### Option 1: Local Development (Recommended for Testing)

#### Backend Setup
1. Base the backend from the provided Colab notebook
2. Install required packages:
   ```bash
   pip install fastapi uvicorn python-socketio python-sqlalchemy supabase sentence-transformers torch transformers faster-whisper
   ```
3. Set up Supabase credentials (or use SQLite only)
4. Run the FastAPI server on **port 8000**:
   ```bash
   uvicorn app:socket_app --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup
1. In the frontend directory:
   ```bash
   npm install
   ```
2. Create/update `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
3. Run development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser

**Test Login:** 
- Username: `teacher`
- Password: `password123`

---

### Option 2: Colab with ngrok (Cloud Development)

#### Backend Setup (Colab)
1. Upload the Colab notebook to Google Colab
2. Set ngrok auth token:
   ```python
   from google.colab import userdata
   NGROK_AUTH_TOKEN = userdata.get("NGROK_AUTH_TOKEN")
   ```
3. Run the server cell - it will output a public ngrok URL
4. Copy the public URL (e.g., `https://xxxx-xx-xxx-xxx-xxx.ngrok-free.app`)

#### Frontend Setup
1. Update `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://xxxx-xx-xxx-xxx-xxx.ngrok-free.app
   ```
2. Rebuild and deploy:
   ```bash
   npm run build
   vercel deploy
   ```

**Note:** Each ngrok session generates a new URL. Update the frontend environment when the backend restarts.

---

### Option 3: Production Deployment

#### Backend (Deploy to Cloud)
- **Railway:** `https://railway.app` (recommended)
- **Heroku:** `https://www.heroku.com`
- **Custom VPS:** AWS EC2, DigitalOcean, etc.

#### Frontend (Vercel)
1. Build and deploy to Vercel
2. Set environment variable in Vercel settings:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

---

## 🔧 Configuration

### Environment Variables

**`.env.local` (Frontend)**

```env
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:8000

# For Colab ngrok:
# NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.app

# For production:
# NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

**Backend Configuration (Colab)**

Update in the notebook before running:

```python
# Supabase Configuration
SUPABASE_URL = "your-supabase-url"
SUPABASE_KEY = "your-supabase-key"

# Model Configuration
MODEL_ID = "Qwen/Qwen2.5-3B-Instruct"
WHISPER_MODEL = "base"  # tiny, base, small, medium, large

# Server Configuration
PORT = 8000
NGROK_AUTH_TOKEN = "your-ngrok-token"
```

---

## 📡 API Endpoints

### Authentication

**POST `/api/auth/login`**
```json
{
  "username": "teacher",
  "password": "password123"
}
```
Response:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "teacher",
    "role": "teacher",
    "email": "teacher@example.com"
  }
}
```

**POST `/api/auth/register`**
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com",
  "role": "student"
}
```

**GET `/api/auth/me`**
- Headers: `Authorization: Bearer <token>`
- Returns: Current user info

### Lectures

**GET `/api/lectures`**
- Headers: `Authorization: Bearer <token>`
- Returns: List of uploaded lectures

**POST `/api/lectures/upload`**
- Headers: `Authorization: Bearer <token>`
- Body:
  ```json
  {
    "title": "Introduction to Python",
    "course": "CS101",
    "content": "Lecture text content..."
  }
  ```

**POST `/api/lectures/upload-file`**
- Headers: `Authorization: Bearer <token>`
- FormData:
  - `file`: PDF/DOCX/TXT file
  - `title`: Lecture title
  - `course`: Course name

### AI Assistant

**POST `/api/assistant/ask`**
- Headers: `Authorization: Bearer <token>`
- Body:
  ```json
  {
    "question": "What is machine learning?",
    "lecture_id": "optional-lecture-id",
    "mode": "rag" | "general"
  }
  ```
- Returns:
  ```json
  {
    "answer": "AI response here",
    "sources": [
      {
        "lecture_title": "ML Basics",
        "chunk_idx": 5,
        "content": "relevant excerpt"
      }
    ]
  }
  ```

### Health Check

**GET `/api/health`**
- No auth required
- Returns:
  ```json
  {
    "llm_ready": true,
    "vector_db": {
      "connected": true
    },
    "stt_ready": true
  }
  ```

---

## 🔌 Socket.IO Events

### Connection
- Establishes WebSocket connection with JWT auth
- Automatically handles reconnection (up to 5 attempts)

### Live Streaming Events

**Emit to Backend:**
- `start_stream`: Start a live lecture session
  ```json
  {
    "title": "Live Lecture Title",
    "course": "CourseCode"
  }
  ```

- `audio_chunk`: Send audio data (16-bit PCM, 16kHz)
  ```
  ArrayBuffer with Int16Array
  ```

- `stop_stream`: End the live session

- `join_live_session`: Join an active session
  ```json
  {
    "session_id": "session-id"
  }
  ```

**Receive from Backend:**
- `system`: System status updates
  ```json
  {
    "type": "streaming_started" | "streaming_stopped" | "joined_live_session",
    "session_id": "...",
    "title": "...",
    "started_by": "..."
  }
  ```

- `insight`: Transcription and insights
  ```json
  {
    "type": "new_insight",
    "data": {
      "transcript": "Transcribed text...",
      "confidence": 0.95
    }
  }
  ```

---

## 🛠️ Troubleshooting

### "Cannot connect to API"
- **Check:** Backend is running on correct port
- **Check:** `NEXT_PUBLIC_API_URL` matches backend address
- **Check:** CORS is enabled on backend
- **Check:** Firewall allows connection

### "Socket.IO connection failed"
- **Check:** Backend Socket.IO is properly initialized
- **Check:** JWT token is valid
- **Check:** Socket.IO path is `/socket.io/`

### "LLM not ready"
- **Check:** Qwen model is downloaded (~7GB)
- **Check:** Sufficient VRAM available
- **Check:** Backend logs for model loading errors

### "Vector DB not connected"
- **Check:** Supabase credentials are correct
- **Check:** pgvector extension enabled in Supabase
- **Check:** Network connectivity to Supabase

### Token Expired
- Frontend automatically logs out and redirects to login
- User needs to login again
- Token stored in localStorage (`sc_token`)

---

## 🧪 Testing Integration

### 1. Test Backend Health
```bash
curl http://localhost:8000/api/health
```

### 2. Test Authentication
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher","password":"password123"}'
```

### 3. Test Frontend
- Open http://localhost:3000
- Login with demo credentials
- Check browser console for errors
- Verify Socket.IO connection in DevTools

### 4. Test Chat
1. Login
2. Go to Dashboard > AI Assistant
3. Send a test message
4. Check if response appears

### 5. Test Live Streaming
1. Login (teacher account required)
2. Go to Dashboard > Live Session
3. Click "Start Live Stream"
4. Speak into microphone
5. Check if transcript appears

---

## 📦 Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] CORS configured to allow frontend domain
- [ ] HTTPS enabled (recommended)
- [ ] Environment variables set correctly
- [ ] JWT secret is secure and consistent
- [ ] Database credentials are secure
- [ ] Supabase setup and vector extension enabled
- [ ] Frontend `NEXT_PUBLIC_API_URL` updated
- [ ] Frontend built and deployed
- [ ] Test login with demo credentials
- [ ] Test file upload
- [ ] Test chat functionality
- [ ] Test live streaming

---

## 📚 Additional Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Socket.IO Docs](https://socket.io/docs/)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Postgres](https://supabase.com/docs/guides/database)
- [Qwen Model Card](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)

---

## 🤝 Support

If you encounter issues:

1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify all environment variables
4. Test API endpoints directly with curl
5. Ensure backend/frontend versions match
