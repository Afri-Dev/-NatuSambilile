
export interface Lesson {
  id: string;
  title: string;
  content: string;
}

export type QuestionType = 'multiple-choice' | 'true-false';

export interface AnswerOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  quizId: string; // To associate with a quiz, though implicitly handled if nested
  text: string;
  questionType: QuestionType;
  options: AnswerOption[]; // For multiple-choice
  correctAnswerId: string; // For multiple-choice and true-false (option id)
  points: number;
}

export interface Quiz {
  id: string;
  moduleId: string; // Explicitly linking to module for easier management
  title: string;
  description?: string;
  questions: Question[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  quizzes: Quiz[]; // Added quizzes to module
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  modules: Module[];
}

export interface GeminiContentRequest {
  prompt: string;
}

// For grounding metadata if used
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web?: GroundingChunkWeb;
  retrievedContext?: {
    uri: string;
    title: string;
  };
}
export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

// --- User Authentication and Roles ---
export type UserRole = 'Admin' | 'Instructor' | 'Student';

export interface UserProgress {
  percentage: number;
  completedLessons: string[];
  lastAccessed?: string;
}

export interface User {
  id: string;
  username: string;
  email: string; 
  password?: string; // Plain text for demo purposes
  role: UserRole;
  lastLogin?: string; // ISO date string of last login
  createdAt?: string; // ISO date string of account creation
  courses?: string[]; // Array of course IDs the user is enrolled in
  quizAttempts?: QuizAttempt[]; // User's quiz attempts
  progress?: UserProgress; // User's learning progress
}

// --- Quiz Attempts ---
export interface StudentAnswer {
  questionId: string;
  selectedOptionId: string | null; // Student's chosen answer option ID
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: StudentAnswer[];
  score: number; // Calculated score
  maxScore: number; // Maximum possible score for this quiz attempt
  submittedAt: string; // ISO date string
}

// --- Student Progress ---
export interface LessonProgress {
  lessonId: string;
  userId: string;
  completedAt: string; // ISO date string
}