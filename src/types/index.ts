// Types for the Learn With AI application

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Note {
  id: string;
  note_name: string;
  title?: string;
  filename?: string;
  summary?: string;
  content?: string;
  uploadedAt?: string;
  fileSize?: number;
  fileType?: string;
}

export interface Question {
  id: string;
  noteId: string;
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'essay';
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[];
  correctAnswer?: string;
  createdAt: string;
}

export interface Answer {
  question: string;
  answer: string;
}

export interface GradedQuestion {
  id: string;
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
  feedback?: string;
  score: number;
  gradedAt: string;
}

export interface Conversation {
  id: string;
  noteId: string;
  messages: ConversationMessage[];
  createdAt: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface QuizSession {
  id: string;
  noteId: string;
  questions: Question[];
  answers: Answer[];
  score?: number;
  totalQuestions: number;
  completedAt?: string;
}