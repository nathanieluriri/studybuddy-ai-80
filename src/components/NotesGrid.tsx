import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  MessageSquare, 
  Brain, 
  Trash2, 
  Upload,
  BookOpen
} from 'lucide-react';
import { Note } from '@/types';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface NotesGridProps {
  onNoteSelect: (note: Note) => void;
  onUploadClick: () => void;
}

export function NotesGrid({ onNoteSelect, onUploadClick }: NotesGridProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const notes = await apiClient.getNotes();
      setNotes(notes || []);
    } catch (error) {
      toast({
        title: 'Failed to load notes',
        description: 'Please try refreshing the page.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      toast({
        title: 'Note deleted',
        description: 'Your note has been removed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Failed to delete note',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Study Notes</h2>
          <p className="text-muted-foreground">
            Upload notes to generate AI-powered quizzes and get instant help
          </p>
        </div>
        <Button onClick={onUploadClick} variant="gradient" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-secondary">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No notes yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Upload your first study note to start generating AI-powered questions and conversations.
              </p>
            </div>
            <Button onClick={onUploadClick} variant="gradient">
              Upload Your First Note
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card 
              key={note.id} 
              className="cursor-pointer hover:shadow-card transition-all duration-200 group"
              onClick={() => onNoteSelect(note)}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <Badge variant="secondary" className="text-xs">
                      {note.fileType?.toUpperCase() || 'FILE'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={(e) => handleDeleteNote(note.id, e)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {note.title || note.filename || note.note_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {note.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.summary}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{note.uploadedAt ? formatDate(note.uploadedAt) : 'Recently uploaded'}</span>
                  </div>
                  {note.fileSize && <span>{formatFileSize(note.fileSize)}</span>}
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Chat
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}