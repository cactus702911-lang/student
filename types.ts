
export interface User {
  id: string;
  username: string;
  password?: string;
  avatar: string;
  isPremium: boolean;
  role: 'user' | 'admin';
  savedPosts: number[];
  // New Profile Fields
  roll?: string;
  institution?: string;
  phone?: string;
  bio?: string;
}

export interface Post {
  id: number;
  userId: string;
  user: string;
  avatar: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  likedBy: string[];
  comments: number;
  isPremium: boolean;
  isLocked?: boolean;
}

export interface Comment {
  id: number;
  postId: number;
  userId: string;
  username: string;
  content: string;
  time: string;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
}

export interface Question {
  id: number;
  content: string;
  image?: string | null;
  answer: string;
  explanation: string;
  tags: string[];
  section?: string;
  exam?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
}

export interface AITrainingData {
    id: number;
    input: string; // The user question or topic
    output: string; // The strictly required answer or information
}

export interface QuestionFilter {
  showAnswer: boolean;
  showExplanation: boolean;
  search: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
