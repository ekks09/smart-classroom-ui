# Smart Classroom AI - Cyberpunk Frontend

A futuristic, cyberpunk-themed AI-powered classroom interface built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Cyberpunk UI**: Neon aesthetics with holographic effects
- **AI Chat Interface**: Interactive conversation with Scholar AI
- **Real-time Audio**: Voice recognition and transcription
- **3D Integration**: Spline 3D backgrounds
- **Responsive Design**: Works on all devices

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D**: Spline
- **UI Components**: shadcn/ui (customized)
- **Real-time**: Socket.IO

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- GitHub account
- Vercel account

## 🚀 Quick Start (Local Development)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ekks09/smart-classroom-ui.git
   cd smart-classroom-ui/smart-classroom-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.dev
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## 🏃‍♂️ Quick Run Script

Use the included `run.sh` script for immediate execution:

```bash
chmod +x run.sh
./run.sh
```

This will install dependencies and start the development server automatically.

## 🌐 Deployment to Vercel

### Step 1: Push to GitHub

1. **Initialize git** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Cyberpunk AI Frontend"
   ```

2. **Create GitHub repository**:
   - Go to [GitHub.com](https://github.com)
   - Click "New repository"
   - Name: `smart-classroom-ai` or your choice
   - Make it public or private
   - Don't initialize with README

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/ekks09/smart-classroom-ai.git
   git push -u origin main
   ```

### Step 2: Deploy on Vercel

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository: `ekks09/smart-classroom-ai`

2. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `smart-classroom-ai` (if your repo has multiple folders)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

3. **Environment Variables**:
   Add these in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://intersystematic-yolonda-gymnogenous.ngrok-free.dev
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build completion
   - Your site will be live at `https://your-project-name.vercel.app`

### Step 3: Update Backend (if needed)

Ensure your FastAPI backend allows CORS for your Vercel domain:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-project-name.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📁 Project Structure

```
smart-classroom-ai/
├── .env.example          # Environment template
├── .env.local           # Local environment (gitignored)
├── next.config.js       # Next.js configuration
├── tailwind.config.ts   # Tailwind configuration
├── components.json      # shadcn/ui configuration
├── package.json         # Dependencies and scripts
├── src/
│   ├── app/             # Next.js app router pages
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx     # Login page
│   │   ├── dashboard/   # Dashboard page
│   │   ├── chat/        # Chat interface
│   │   └── live/        # Live audio page
│   ├── components/      # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── scholar/     # Custom cyberpunk components
│   │   └── layout/      # Layout components
│   ├── lib/             # Utilities and API functions
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript type definitions
└── run.sh               # Quick start script
```

## 🎨 Customization

### Colors
Edit `tailwind.config.ts` to customize the cyberpunk color scheme:

```typescript
colors: {
  cyber: {
    black: "#050505",
    cyan: "#00f5d4",
    blue: "#00bbf9",
    purple: "#9b5de5",
  },
}
```

### Animations
Add custom keyframes in `tailwind.config.ts`:

```typescript
keyframes: {
  yourAnimation: {
    "0%, 100%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.1)" },
  },
}
```

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Deployment
npm run build        # Vercel handles this automatically
```

## 🌟 Features Overview

- **Login Page**: Secure authentication with cyberpunk styling
- **Dashboard**: System status and quick actions
- **AI Chat**: Interactive conversation with citations
- **Live Audio**: Real-time voice recognition and transcription
- **Responsive**: Works on desktop, tablet, and mobile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own cyberpunk AI interfaces!

## 🆘 Support

If you encounter issues:
1. Check the console for errors
2. Verify environment variables
3. Ensure backend is running and accessible
4. Check Vercel deployment logs

---

Built with ❤️ for the future of education