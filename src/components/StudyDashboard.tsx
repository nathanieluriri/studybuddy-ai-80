import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NotesGrid } from './NotesGrid';
import { UploadModal } from './UploadModal';
import { ChatInterface } from './ChatInterface';
import { QuizInterface } from './QuizInterface';
import { 
  GraduationCap, 
  LogOut, 
  Brain, 
  MessageSquare, 
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { Note } from '@/types';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface StudyDashboardProps {
  onLogout: () => void;
}

type ViewMode = 'dashboard' | 'chat' | 'quiz';

export function StudyDashboard({ onLogout }: StudyDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
  };

  const handleChatWithNote = (note: Note) => {
    setSelectedNote(note);
    setViewMode('chat');
  };

  const handleQuizWithNote = (note: Note) => {
    setSelectedNote(note);
    setViewMode('quiz');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedNote(null);
  };

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: 'Note uploaded successfully!',
      description: 'Your study material is ready for AI-powered learning.',
    });
  };

  const handleLogout = () => {
    apiClient.logout();
    onLogout();
    toast({
      title: 'Logged out',
      description: 'Come back soon to continue learning!',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {viewMode !== 'dashboard' && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleBackToDashboard}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Learn With AI</h1>
                {selectedNote && (
                  <p className="text-sm text-muted-foreground truncate max-w-xs">
                    {selectedNote.title || selectedNote.filename}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedNote && viewMode === 'dashboard' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleChatWithNote(selectedNote)}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuizWithNote(selectedNote)}
                  className="gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Quiz
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {viewMode === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome to your Study Space
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload your study materials and let AI help you learn faster with personalized quizzes and instant answers.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last week
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">
                    +12 from last week
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Conversations</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28</div>
                  <p className="text-xs text-muted-foreground">
                    +5 from last week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Notes Grid */}
            <NotesGrid 
              key={refreshKey}
              onNoteSelect={handleNoteSelect}
              onUploadClick={() => setIsUploadModalOpen(true)}
            />
          </div>
        )}

        {viewMode === 'chat' && selectedNote && (
          <ChatInterface 
            note={selectedNote}
            onBack={handleBackToDashboard}
          />
        )}

        {viewMode === 'quiz' && selectedNote && (
          <QuizInterface 
            note={selectedNote}
            onBack={handleBackToDashboard}
          />
        )}
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}