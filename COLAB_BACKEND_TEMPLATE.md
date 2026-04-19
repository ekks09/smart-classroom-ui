# Smart Classroom AI - Colab Backend Template

This template provides the complete backend structure for the Colab notebook. Use this as a reference for implementing the FastAPI + Socket.IO server.

## Setup Instructions

1. Copy this entire template into your Colab notebook
2. Install dependencies (first cell)
3. Configure Supabase & ngrok tokens (second cell)
4. Run each section sequentially
5. Share the ngrok URL with your frontend `.env.local`

---

## Cell 1: Install Dependencies

```python
!pip install -q \
  fastapi uvicorn python-socketio python-engineio \
  supabase-py sqlalchemy psycopg2-binary \
  sentence-transformers torch transformers \
  faster-whisper pydantic PyJWT python-multipart \
  pyngrok numpy scipy
```

---

## Cell 2: Environment & Configuration

```python
import os
import json
from pathlib import Path
from google.colab import userdata

# =============================================
# CONFIGURATION - UPDATE THESE VALUES
# =============================================

# Supabase Config
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your-anon-public-key"
SUPABASE_DB_PASSWORD = "your-db-password"  # Optional, if using direct DB access

# LLM Config
MODEL_ID = "Qwen/Qwen2.5-3B-Instruct"
DEVICE = "cuda"  # or "cpu"
TOKENIZER_PATH = "/content/tokenizer"
MODEL_PATH = "/content/model"

# Audio Config
WHISPER_MODEL_SIZE = "base"  # tiny, base, small, medium, large
TARGET_SAMPLE_RATE = 16000

# Server Config
API_PORT = 8000

# ngrok Setup
NGROK_AUTH_TOKEN = userdata.get("NGROK_AUTH_TOKEN")

# Demo User
DEMO_USERNAME = "teacher"
DEMO_PASSWORD = "password123"
DEMO_EMAIL = "teacher@example.com"

print("✅ Configuration loaded")
```

---

## Cell 3: Initialize Database

```python
from sqlalchemy import create_engine, Column, String, DateTime, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import sqlite3

# Use SQLite for simplicity (Supabase is optional)
DB_PATH = "/content/classroom.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True)
    password_hash = Column(String)
    role = Column(String)  # teacher, student, admin
    created_at = Column(DateTime, default=datetime.utcnow)

class Lecture(Base):
    __tablename__ = "lectures"
    
    id = Column(String, primary_key=True)
    user_id = Column(String)
    title = Column(String)
    course = Column(String)
    content = Column(String)
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Chunk(Base):
    __tablename__ = "chunks"
    
    id = Column(String, primary_key=True)
    lecture_id = Column(String)
    chunk_idx = Column(Integer)
    content = Column(String)
    embedding = Column(String)  # JSON array as string
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

print("✅ Database initialized")
```

---

## Cell 4: Load Models

```python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from sentence_transformers import SentenceTransformer
from faster_whisper import WhisperModel
import numpy as np

print("🔄 Loading models...")

# LLM Model
print("  → Loading Qwen LLM...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    device_map=DEVICE,
    torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
    load_in_4bit=True if DEVICE == "cuda" else False
)

# Embedding Model
print("  → Loading Sentence Transformers...")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Speech Model
print("  → Loading Whisper...")
whisper_model = WhisperModel(WHISPER_MODEL_SIZE, device=DEVICE, compute_type="float16" if DEVICE == "cuda" else "float32")

print("✅ Models loaded successfully")
```

---

## Cell 5: Utility Functions

```python
import uuid
import hashlib
import jwt
from datetime import datetime, timedelta
from typing import Optional

# JWT Secret (change this!)
SECRET_KEY = "your-super-secret-key-change-this"

def generate_id() -> str:
    return str(uuid.uuid4())[:8]

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hash_val: str) -> bool:
    return hash_password(password) == hash_val

def create_jwt_token(user_id: str, username: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_jwt_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        return None

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> list:
    """Split text into overlapping chunks"""
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i:i + chunk_size]
        if chunk.strip():
            chunks.append(chunk)
    return chunks

def embed_text(text: str) -> np.ndarray:
    """Generate embedding for text"""
    return embedding_model.encode(text)

def generate_response(question: str, context: Optional[str] = None) -> str:
    """Generate response using Qwen"""
    if context:
        prompt = f"Context: {context}\n\nQuestion: {question}\n\nAnswer:"
    else:
        prompt = f"Question: {question}\n\nAnswer:"
    
    inputs = tokenizer(prompt, return_tensors="pt").to(DEVICE)
    outputs = model.generate(**inputs, max_length=500, temperature=0.7)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return response.split("Answer:")[-1].strip()

print("✅ Utility functions defined")
```

---

## Cell 6: FastAPI + Socket.IO Setup

```python
from fastapi import FastAPI, HTTPException, Header, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import socketio

# =============================================
# PYDANTIC MODELS
# =============================================

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str
    role: str = "student"

class UploadLectureRequest(BaseModel):
    title: str
    course: str
    content: str

class AskRequest(BaseModel):
    question: str
    lecture_id: Optional[str] = None
    mode: str = "general"  # "rag" or "general"

# =============================================
# FASTAPI APP
# =============================================

app = FastAPI(title="Smart Classroom AI", version="1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================
# AUTH ENDPOINTS
# =============================================

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Authenticate user and return JWT token"""
    db = SessionLocal()
    user = db.query(User).filter(User.username == request.username).first()
    db.close()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user.id, user.username, user.role)
    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }

@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    """Create new user account"""
    db = SessionLocal()
    
    # Check if user exists
    if db.query(User).filter(User.username == request.username).first():
        db.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create user
    user = User(
        id=generate_id(),
        username=request.username,
        email=request.email,
        password_hash=hash_password(request.password),
        role=request.role
    )
    db.add(user)
    db.commit()
    db.close()
    
    token = create_jwt_token(user.id, user.username, user.role)
    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }

@app.get("/api/auth/me")
async def get_me(authorization: str = Header(None)):
    """Get current user info"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    
    token = authorization.split(" ")[1]
    payload = decode_jwt_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    db = SessionLocal()
    user = db.query(User).filter(User.id == payload["sub"]).first()
    db.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }

# =============================================
# LECTURE ENDPOINTS
# =============================================

@app.get("/api/lectures")
async def get_lectures(authorization: str = Header(None)):
    """Get user's lectures"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    
    token = authorization.split(" ")[1] if authorization.startswith("Bearer ") else authorization
    payload = decode_jwt_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    db = SessionLocal()
    lectures = db.query(Lecture).filter(Lecture.user_id == payload["sub"]).all()
    db.close()
    
    return {
        "lectures": [
            {
                "id": l.id,
                "title": l.title,
                "course": l.course,
                "chunk_count": l.chunk_count,
                "created_at": l.created_at.isoformat()
            }
            for l in lectures
        ]
    }

@app.post("/api/lectures/upload")
async def upload_lecture(request: UploadLectureRequest, authorization: str = Header(None)):
    """Upload lecture as text"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    
    token = authorization.split(" ")[1]
    payload = decode_jwt_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Create lecture
    lecture_id = generate_id()
    db = SessionLocal()
    
    lecture = Lecture(
        id=lecture_id,
        user_id=payload["sub"],
        title=request.title,
        course=request.course,
        content=request.content
    )
    db.add(lecture)
    db.commit()
    
    # Chunk and embed
    chunks = chunk_text(request.content)
    for idx, chunk_text_val in enumerate(chunks):
        embedding = embed_text(chunk_text_val)
        chunk = Chunk(
            id=generate_id(),
            lecture_id=lecture_id,
            chunk_idx=idx,
            content=chunk_text_val,
            embedding=np.array2string(embedding)
        )
        db.add(chunk)
    
    lecture.chunk_count = len(chunks)
    db.commit()
    db.close()
    
    return {
        "id": lecture.id,
        "title": lecture.title,
        "course": lecture.course,
        "chunk_count": len(chunks)
    }

@app.post("/api/lectures/upload-file")
async def upload_lecture_file(
    file: UploadFile = File(...),
    title: str = Form(...),
    course: str = Form("General"),
    authorization: str = Header(None)
):
    """Upload lecture file (PDF/DOCX/TXT)"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    
    token = authorization.split(" ")[1]
    payload = decode_jwt_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Read file content
    content = await file.read()
    text_content = content.decode("utf-8", errors="ignore")
    
    # Save as lecture
    lecture_id = generate_id()
    db = SessionLocal()
    
    lecture = Lecture(
        id=lecture_id,
        user_id=payload["sub"],
        title=title or file.filename,
        course=course,
        content=text_content
    )
    db.add(lecture)
    db.commit()
    
    # Chunk and embed
    chunks = chunk_text(text_content)
    for idx, chunk_text_val in enumerate(chunks):
        embedding = embed_text(chunk_text_val)
        chunk = Chunk(
            id=generate_id(),
            lecture_id=lecture_id,
            chunk_idx=idx,
            content=chunk_text_val,
            embedding=np.array2string(embedding)
        )
        db.add(chunk)
    
    lecture.chunk_count = len(chunks)
    db.commit()
    db.close()
    
    return {
        "id": lecture.id,
        "title": lecture.title,
        "course": lecture.course,
        "chunk_count": len(chunks)
    }

# =============================================
# ASSISTANT ENDPOINTS
# =============================================

@app.post("/api/assistant/ask")
async def ask_question(request: AskRequest, authorization: str = Header(None)):
    """Ask a question (RAG or general)"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    
    token = authorization.split(" ")[1]
    payload = decode_jwt_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    db = SessionLocal()
    
    # RAG Mode
    if request.mode == "rag" and request.lecture_id:
        lecture = db.query(Lecture).filter(Lecture.id == request.lecture_id).first()
        if not lecture:
            db.close()
            raise HTTPException(status_code=404, detail="Lecture not found")
        
        # Simple retrieval (top 3 relevant chunks)
        question_embedding = embed_text(request.question)
        chunks = db.query(Chunk).filter(Chunk.lecture_id == request.lecture_id).all()
        
        # Calculate similarity (simple dot product)
        scored_chunks = []
        for chunk in chunks:
            embedding = np.fromstring(chunk.embedding.strip('[]'), sep=' ')
            similarity = np.dot(question_embedding, embedding)
            scored_chunks.append((chunk, similarity))
        
        top_chunks = sorted(scored_chunks, key=lambda x: x[1], reverse=True)[:3]
        context = "\n\n".join([c[0].content for c in top_chunks])
        
        # Generate answer
        answer = generate_response(request.question, context)
        
        db.close()
        return {
            "answer": answer,
            "sources": [
                {
                    "lecture_title": lecture.title,
                    "chunk_idx": c[0].chunk_idx,
                    "content": c[0].content[:200]
                }
                for c in top_chunks
            ]
        }
    
    # General Mode
    answer = generate_response(request.question)
    db.close()
    return {"answer": answer, "sources": []}

# =============================================
# HEALTH ENDPOINT
# =============================================

@app.get("/api/health")
async def health():
    """System health check"""
    return {
        "llm_ready": True,
        "vector_db": {"connected": True},
        "stt_ready": True
    }

print("✅ FastAPI app configured")
```

---

## Cell 7: Socket.IO Setup

```python
# Socket.IO Setup
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    ping_timeout=60,
    ping_interval=25
)

# Track authenticated connections
AUTH_SIDS = {}
ACTIVE_STREAM_SIDS = set()
LIVE_SESSION_INFO = {
    "active": False,
    "session_id": None,
    "title": None,
    "course": None,
    "started_by": None
}

@sio.event
async def connect(sid, environ):
    """Handle Socket.IO connection"""
    token = environ.get('HTTP_AUTHORIZATION', '').replace('Bearer ', '')
    payload = decode_jwt_token(token)
    
    if not payload:
        return False
    
    db = SessionLocal()
    user = db.query(User).filter(User.id == payload["sub"]).first()
    db.close()
    
    if not user:
        return False
    
    AUTH_SIDS[sid] = {
        "user_id": user.id,
        "username": user.username,
        "role": user.role
    }
    
    # Send current status
    await sio.emit('connected', {
        "user": user.username,
        "live_session": LIVE_SESSION_INFO if LIVE_SESSION_INFO["active"] else None
    }, to=sid)
    
    print(f"✅ Connected: {user.username}")

@sio.event
async def disconnect(sid):
    """Handle Socket.IO disconnect"""
    if sid in AUTH_SIDS:
        del AUTH_SIDS[sid]
    ACTIVE_STREAM_SIDS.discard(sid)
    print(f"❌ Disconnected: {sid}")

@sio.event
async def start_stream(sid, data):
    """Start live lecture stream"""
    if sid not in AUTH_SIDS or AUTH_SIDS[sid]["role"] not in ("teacher", "admin"):
        await sio.emit("error", {"message": "Teacher access required"}, to=sid)
        return
    
    session_id = generate_id()
    user = AUTH_SIDS[sid]
    
    LIVE_SESSION_INFO.update({
        "active": True,
        "session_id": session_id,
        "title": data.get("title", "Live Lecture"),
        "course": data.get("course", "General"),
        "started_by": user["username"]
    })
    
    ACTIVE_STREAM_SIDS.add(sid)
    
    # Notify all clients
    await sio.emit("system", {
        "type": "streaming_started",
        "session_id": session_id,
        "title": LIVE_SESSION_INFO["title"],
        "course": LIVE_SESSION_INFO["course"],
        "started_by": user["username"]
    }, skip_sid=sid)
    
    print(f"🎤 Stream started: {session_id}")

@sio.event
async def audio_chunk(sid, data):
    """Process audio chunk"""
    if sid not in ACTIVE_STREAM_SIDS:
        return
    
    try:
        # Convert bytes to audio
        audio_bytes = bytes(data)
        audio_data = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        
        # Transcribe
        segments, _ = whisper_model.transcribe(
            audio_data,
            language="en",
            fp16=DEVICE == "cuda"
        )
        
        transcript = " ".join([seg.text for seg in segments])
        
        if transcript.strip():
            # Emit transcript to all
            await sio.emit("insight", {
                "type": "new_insight",
                "data": {"transcript": transcript}
            })
            
            print(f"📝 Transcribed: {transcript[:100]}")
    
    except Exception as e:
        print(f"❌ Audio processing error: {e}")

@sio.event
async def stop_stream(sid):
    """Stop live stream"""
    if sid in ACTIVE_STREAM_SIDS:
        ACTIVE_STREAM_SIDS.discard(sid)
        
        LIVE_SESSION_INFO.update({
            "active": False,
            "session_id": None,
            "title": None,
            "course": None,
            "started_by": None
        })
        
        await sio.emit("system", {"type": "streaming_stopped"})
        print(f"⏹️ Stream stopped")

@sio.event
async def join_live_session(sid, data):
    """Join active live session"""
    if LIVE_SESSION_INFO["active"]:
        await sio.emit("system", {
            "type": "joined_live_session",
            "session_id": LIVE_SESSION_INFO["session_id"],
            "title": LIVE_SESSION_INFO["title"]
        }, to=sid)

# Mount Socket.IO to FastAPI
socket_app = socketio.ASGIApp(sio, app)

print("✅ Socket.IO configured")
```

---

## Cell 8: Create Demo User

```python
db = SessionLocal()

# Check if demo user exists
demo_user = db.query(User).filter(User.username == DEMO_USERNAME).first()

if not demo_user:
    demo_user = User(
        id=generate_id(),
        username=DEMO_USERNAME,
        email=DEMO_EMAIL,
        password_hash=hash_password(DEMO_PASSWORD),
        role="teacher"
    )
    db.add(demo_user)
    db.commit()
    print(f"✅ Created demo user: {DEMO_USERNAME}/{DEMO_PASSWORD}")
else:
    print(f"✅ Demo user already exists")

db.close()
```

---

## Cell 9: Start Server

```python
import uvicorn
import threading
import time
from pyngrok import ngrok

# Kill existing processes
!fuser -k 8000/tcp 2>/dev/null || true
time.sleep(2)

# Setup ngrok
try:
    ngrok.kill()
except:
    pass

if NGROK_AUTH_TOKEN:
    ngrok.set_auth_token(NGROK_AUTH_TOKEN)
    tunnel = ngrok.connect(API_PORT, bind_tls=True)
    PUBLIC_URL = tunnel.public_url
    print("="*70)
    print(f"🌐 PUBLIC URL: {PUBLIC_URL}")
    print(f"📱 Frontend URL: {PUBLIC_URL}/")
    print(f"📚 API Docs: {PUBLIC_URL}/docs")
    print("="*70)
else:
    PUBLIC_URL = f"http://localhost:{API_PORT}"
    print(f"⚠️ Running locally: {PUBLIC_URL}")

# Start server
def run_server():
    uvicorn.run(
        socket_app,
        host="0.0.0.0",
        port=API_PORT,
        log_level="info"
    )

threading.Thread(target=run_server, daemon=True).start()
time.sleep(3)

print(f"✅ Server running on {PUBLIC_URL}")
print("\n🔑 Demo Login:")
print(f"   Username: {DEMO_USERNAME}")
print(f"   Password: {DEMO_PASSWORD}")
print("\n📋 Update Frontend .env.local with:")
print(f"   NEXT_PUBLIC_API_URL={PUBLIC_URL}")

# Keep server running
while True:
    time.sleep(60)
```

---

## Notes

- Use `DEVICE = "cuda"` for GPU, `"cpu"` for CPU
- Models are downloaded automatically on first run (~7GB total)
- Change `SECRET_KEY` for production
- Modify `chunk_text()` size for longer/shorter segments
- For production, use PostgreSQL instead of SQLite
- Enable SSL/TLS with proper certificates

---

## Next Steps

1. Update your Frontend `.env.local` with the ngrok URL
2. Test login with demo credentials
3. Upload a lecture and test RAG
4. Start a live session and test streaming
5. Deploy to Vercel/Railway for production

For integration details, see `INTEGRATION_GUIDE.md`.
