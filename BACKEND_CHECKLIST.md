# Smart Classroom AI Backend - Integration Checklist

This document verifies that your FastAPI backend has all required endpoints and features for frontend integration.

## ✅ Backend Endpoints Required

### Authentication (`/api/auth/*`)
- [x] POST `/api/auth/login` → Returns `{token, user}`
- [x] POST `/api/auth/register` → Creates user, Returns `{token, user}`
- [x] GET `/api/auth/me` → Returns `{user}` (requires Bearer token)

### Lectures (`/api/lectures*`)
- [x] GET `/api/lectures` → Returns `{lectures: [...]}`
- [x] POST `/api/lectures/upload` → Accepts JSON body with title, course, content
- [x] POST `/api/lectures/upload-file` → Accepts FormData with file upload

### AI Assistant (`/api/assistant/*`)
- [x] POST `/api/assistant/ask` → Accepts `{question, lecture_id?, mode}`, Returns `{answer, sources}`

### System Health (`/api/health`)
- [x] GET `/api/health` → Returns `{llm_ready, vector_db, stt_ready}`

---

## ✅ Socket.IO Events Required

### Connection & Auth
- [x] Accept JWT auth in `io()` connection
- [x] Emit `connected` event with live session info

### Live Streaming Events (Teacher/Admin only)
- [x] `start_stream` → Emit `system` with `{type: "streaming_started", ...}`
- [x] `audio_chunk` → Receive binary audio data (Int16Array, 16kHz)
- [x] `stop_stream` → Emit `system` with `{type: "streaming_stopped"}`

### Live Session Participant Events
- [x] `join_live_session` → Join broadcast room
- [x] `leave_live_session` → Leave broadcast room

### Broadcast Events
- [x] `system` → Emit session updates to room
- [x] `insight` → Emit transcription/insights to room
- [x] `chat_response` → Emit AI chat responses

---

## ✅ Response Format Examples

### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "username": "teacher",
    "email": "teacher@example.com",
    "role": "teacher"
  }
}
```

### Lectures Response
```json
{
  "lectures": [
    {
      "id": "lecture-1",
      "title": "Python Basics",
      "course": "CS101",
      "chunk_count": 24,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Ask Question Response
```json
{
  "answer": "Machine learning is a subset of artificial intelligence...",
  "sources": [
    {
      "lecture_title": "AI Fundamentals",
      "chunk_idx": 5,
      "content": "Optional: excerpt of relevant text"
    }
  ]
}
```

### Health Response
```json
{
  "llm_ready": true,
  "vector_db": {
    "connected": true,
    "count": 1250,
    "embedding_dim": 384
  },
  "stt_ready": true
}
```

---

## 🔒 Security Checklist

- [x] JWT tokens signed with secure secret
- [x] Bearer token validation on protected endpoints
- [x] Role-based access control (teacher-only endpoints)
- [x] Input validation on all endpoints
- [x] CORS headers configured for frontend domain
- [x] File upload validation (size, type)
- [x] Password hashing (bcrypt recommended)
- [x] SQL injection prevention (use parameterized queries)

---

## 🔌 CORS Configuration

Add to FastAPI app:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",          # Local dev
        "https://localhost:3000",
        "https://your-vercel-domain.com", # Production
        "https://*.ngrok-free.app",       # Colab ngrok
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🧪 Test Your Backend

### 1. Test authentication
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher","password":"password123"}'
```

### 2. Test health check
```bash
curl http://localhost:8000/api/health
```

### 3. Test protected endpoint
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/lectures
```

### 4. Test Socket.IO
```javascript
const socket = io('http://localhost:8000', {
  path: '/socket.io/',
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.on('connect', () => console.log('Connected!'));
socket.emit('start_stream', { title: 'Test', course: 'TEST' });
```

---

## 📝 Error Responses

Backend should return proper HTTP status codes with error details:

```json
{
  "detail": "Invalid credentials",
  "status_code": 401
}
```

or

```json
{
  "message": "Unauthorized",
  "detail": "Token expired"
}
```

The frontend API client expects either `detail` or `message` field.

---

## 🚀 Deployment Notes

### Colab with ngrok
1. Install pyngrok: `pip install pyngrok`
2. Set ngrok token via Google Colab secrets
3. Create tunnel and get public URL
4. Update frontend: `NEXT_PUBLIC_API_URL=https://your-ngrok-url`

### Production
1. Deploy backend to Railway, Heroku, or VPS
2. Set environment variables on hosting platform
3. Update CORS to include production frontend domain
4. Use HTTPS certificates
5. Set production database URL
6. Enable proper logging and monitoring

---

## 📚 Backend Template

Use this basic structure for your Colab notebook:

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from socketio import ASGIApp
import socketio

# Initialize
app = FastAPI()
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*'
)

# CORS middleware
app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)

# Routes
@app.post("/api/auth/login")
async def login(username: str, password: str):
    # Verify credentials, generate JWT
    return {"token": "jwt_here", "user": {...}}

@app.post("/api/auth/register")
async def register(username: str, password: str, email: str, role: str):
    # Create user, generate JWT
    return {"token": "jwt_here", "user": {...}}

@app.get("/api/auth/me")
async def get_me(token: str = Header(...)):
    # Validate token, return user
    return {"user": {...}}

@app.get("/api/lectures")
async def get_lectures(token: str = Header(...)):
    # Return user's lectures
    return {"lectures": [...]}

@app.post("/api/lectures/upload")
async def upload_lecture(token: str = Header(...), body = Body(...)):
    # Save lecture, chunk, embed
    return {"id": "...", "title": "...", ...}

@app.post("/api/assistant/ask")
async def ask_question(token: str = Header(...), body = Body(...)):
    # RAG retrieval + LLM generation
    return {"answer": "...", "sources": [...]}

@app.get("/api/health")
async def health():
    # Check system status
    return {"llm_ready": True, "vector_db": {...}, ...}

# Socket.IO
@sio.event
async def connect(sid, environ):
    token = environ.get('HTTP_AUTHORIZATION')
    # Validate token and store mapping

@sio.event
async def start_stream(sid, data):
    # Handle live stream start
    # Emit 'system' event with streaming_started

@sio.event
async def audio_chunk(sid, data):
    # Process audio, transcribe
    # Emit 'insight' with transcript

@sio.event
async def stop_stream(sid):
    # Handle stream stop
    # Emit 'system' event with streaming_stopped

# Mount
socket_app = ASGIApp(sio, app)

# Run: uvicorn app:socket_app --host 0.0.0.0 --port 8000
```

---

## ❓ Common Issues & Solutions

### "CORS policy blocked"
→ Add proper CORS middleware to backend

### "Invalid token"
→ Verify JWT secret matches, token format is correct

### "Socket.IO connection fails"
→ Check auth token is passed, Socket.IO initialization, path is `/socket.io/`

### "Audio not being transcribed"
→ Verify audio format is PCM16, sample rate is 16kHz, chunk size is sufficient

### "Lectures not appearing"
→ Verify embeddings are being saved to vector DB, lecture chunks are being created

---

For more details, see `INTEGRATION_GUIDE.md` in the frontend repository.
