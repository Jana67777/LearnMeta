export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

export interface TestResult {
  id: string;
  user_id: string;
  test_type: 'pre' | 'post';
  answers: Record<string, string>;
  score: number | null;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}