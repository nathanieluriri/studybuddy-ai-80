// API configuration and utilities for Learn With AI
const BASE_URL = 'https://learn-with-ai.getxoxo.space';

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    register: '/api/v1/auth/register',
    login: '/api/v1/auth/login',
  },
  notes: {
    upload: '/api/v1/notes/upload',
    list: '/api/v1/notes',
    get: (id: string) => `/api/v1/notes/${id}`,
    delete: (id: string) => `/api/v1/notes/${id}`,
    ask: (id: string) => `/api/v1/notes/${id}/ask`,
    generateQuestions: (id: string) => `/api/v1/notes/${id}/generate-questions`,
    submitAnswers: (id: string) => `/api/v1/notes/${id}/submit-answers`,
    conversations: (id: string) => `/api/v1/notes/${id}/conversations`,
  },
  questions: {
    graded: (id: string) => `/api/v1/questions/${id}/graded`,
  },
};

// API client class
export class LearnWithAIClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Auth methods
  async register(email: string, password: string, name: string) {
    const response = await this.request<{ message: string; data: { token: string; name: string } }>(
      API_ENDPOINTS.auth.register,
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }
    );
    this.token = response.data.token;
    localStorage.setItem('authToken', this.token);
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ message: string; data: { token: string; name: string } }>(
      API_ENDPOINTS.auth.login,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    this.token = response.data.token;
    localStorage.setItem('authToken', this.token);
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Notes methods
  async uploadNote(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.notes.upload}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }

  async getNotes() {
    return this.request(API_ENDPOINTS.notes.list);
  }

  async getNote(id: string) {
    return this.request(API_ENDPOINTS.notes.get(id));
  }

  async deleteNote(id: string) {
    return this.request(API_ENDPOINTS.notes.delete(id), { method: 'DELETE' });
  }

  async askQuestion(noteId: string, question: string) {
    return this.request(API_ENDPOINTS.notes.ask(noteId), {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  async generateQuestions(
    noteId: string,
    questionType: string,
    numberOfQuestions: number,
    difficulty: string
  ) {
    return this.request(API_ENDPOINTS.notes.generateQuestions(noteId), {
      method: 'POST',
      body: JSON.stringify({
        question_type: questionType,
        number_of_questions: numberOfQuestions,
        difficulty,
      }),
    });
  }

  async submitAnswers(noteId: string, answers: Array<{ question: string; answer: string }>) {
    return this.request(API_ENDPOINTS.notes.submitAnswers(noteId), {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async getConversations(noteId: string) {
    return this.request(API_ENDPOINTS.notes.conversations(noteId));
  }

  async getGradedQuestion(questionId: string) {
    return this.request(API_ENDPOINTS.questions.graded(questionId));
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiClient = new LearnWithAIClient();