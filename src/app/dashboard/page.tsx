'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Database, Cpu, Upload, BookOpen, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { HealthStatus, Lecture } from '@/types';
import { FloatingIcons } from '@/components/scholar/FloatingIcons';
import { Header } from '@/components/layout/Header';

export default function DashboardPage() {
  const { token, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTab, setUploadTab] = useState<'text' | 'file'>('text');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    course: 'General',
    content: ''
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    fetchData();
  }, [isAuthenticated, router]);

  const fetchData = async () => {
    try {
      const [healthData, lecturesData] = await Promise.all([
        api.getHealth(),
        api.getLectures(token!)
      ]);
      setHealth(healthData);
      setLectures(lecturesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setUploading(true);
    try {
      await api.uploadLecture(token, uploadForm);
      setUploadForm({ title: '', course: 'General', content: '' });
      setUploadFile(null);
      setShowUpload(false);
      fetchData(); // Refresh lectures
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !uploadFile) return;

    setUploading(true);
    try {
      await api.uploadLectureFile(token, uploadFile, uploadForm.title, uploadForm.course);
      setUploadForm({ title: '', course: 'General', content: '' });
      setUploadFile(null);
      setShowUpload(false);
      fetchData();
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      title: 'Vector Integrity',
      value: health?.vector_db?.connected ? 'Connected' : 'Disconnected',
      icon: Database,
      color: health?.vector_db?.connected ? 'text-neon-cyan' : 'text-warning-purple',
      description: `${health?.vector_db?.count || 0} embeddings stored`,
    },
    {
      title: 'Backend Status',
      value: health?.status === 'healthy' ? 'Online' : 'Offline',
      icon: Brain,
      color: health?.status === 'healthy' ? 'text-neon-cyan' : 'text-warning-purple',
      description: `Server: ${health?.server || 'Unknown'}`,
    },
    {
      title: 'LLM Engine',
      value: 'Qwen 2.5-3B',
      icon: Cpu,
      color: 'text-neon-cyan',
      description: 'Ready for inference',
    },
  ];

  return (
    <div className="min-h-screen bg-void-black relative scanlines">
      <FloatingIcons />
      <Header />

      <div className="relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-neon-cyan">Mission Control</h2>
            {isTeacher ? (
              <Button
                onClick={() => setShowUpload(!showUpload)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Lecture</span>
              </Button>
            ) : (
              <div className="text-sm text-electric-blue">
                Student view
              </div>
            )}
          </div>

          {/* Upload Form */}
          {isTeacher && showUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card className="glass holographic">
                <CardHeader>
                  <CardTitle className="text-neon-cyan">Upload New Lecture</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      type="button"
                      onClick={() => setUploadTab('text')}
                      className={uploadTab === 'text' ? '' : 'bg-transparent border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10'}
                    >
                      Paste Text
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setUploadTab('file')}
                      className={uploadTab === 'file' ? '' : 'bg-transparent border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10'}
                    >
                      Upload PDF/DOCX
                    </Button>
                  </div>

                  <form onSubmit={uploadTab === 'text' ? handleUploadText : handleUploadFile} className="space-y-4">
                    <div>
                      <Input
                        placeholder="Lecture Title"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                        className="bg-transparent border-neon-cyan/50 text-neon-cyan"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Course Name"
                        value={uploadForm.course}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, course: e.target.value }))}
                        className="bg-transparent border-neon-cyan/50 text-neon-cyan"
                      />
                    </div>

                    {uploadTab === 'text' ? (
                      <div>
                        <Textarea
                          placeholder="Lecture Content"
                          value={uploadForm.content}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, content: e.target.value }))}
                          rows={6}
                          required
                          className="bg-transparent border-neon-cyan/50 text-neon-cyan"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          required
                          className="bg-transparent border-neon-cyan/50 text-neon-cyan file:text-neon-cyan file:bg-transparent file:border-0"
                        />
                        <p className="text-xs text-electric-blue">
                          Supported: PDF, DOC, DOCX.
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={uploading || (uploadTab === 'file' && !uploadFile)}
                        className="flex-1"
                      >
                        {uploading ? 'Uploading...' : 'Upload Lecture'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass holographic">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg text-neon-cyan mb-2">
                          {stat.title}
                        </h3>
                        <p className={`text-2xl font-bold ${stat.color} mb-1`}>
                          {stat.value}
                        </p>
                        <p className="text-sm text-electric-blue">
                          {stat.description}
                        </p>
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color} glow`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Lectures Grid */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-neon-cyan mb-4">Knowledge Base</h3>
            {loading ? (
              <div className="text-center text-neon-cyan">Loading lectures...</div>
            ) : lectures.length === 0 ? (
              <Card className="glass holographic">
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-warning-purple" />
                  <h4 className="text-xl text-neon-cyan mb-2">No Lectures Yet</h4>
                  <p className="text-electric-blue mb-4">
                    {isTeacher
                      ? 'Upload your first lecture to get started with AI-powered Q&A.'
                      : 'Ask your teacher to upload lecture materials, or use Ask AI for general questions.'}
                  </p>
                  {isTeacher ? (
                    <Button onClick={() => setShowUpload(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Lecture
                    </Button>
                  ) : (
                    <Button onClick={() => router.push('/ask-ai')}>
                      <Brain className="w-4 h-4 mr-2" />
                      Ask AI
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lectures.map((lecture, index) => (
                  <motion.div
                    key={lecture.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass holographic cursor-pointer hover:border-neon-cyan transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3 mb-4">
                          <BookOpen className="w-6 h-6 text-neon-cyan mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="text-lg font-bold text-neon-cyan mb-1">{lecture.title}</h4>
                            <p className="text-sm text-electric-blue">{lecture.course}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-xs text-electric-blue">
                          <p>Chunks: {lecture.chunk_count || 0}</p>
                          <p>Uploaded: {lecture.uploaded_at ? new Date(lecture.uploaded_at).toLocaleDateString() : 'Unknown'}</p>
                        </div>
                        <Button
                          className="w-full mt-4"
                          onClick={() => router.push(`/chat?lecture=${lecture.id}`)}
                        >
                          Ask AI
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
