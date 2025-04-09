// User profile
export interface User {
  id: string;
  username: string;
}

// Authentication models
export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface RegisterRequestDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  id: string;
  username: string;
  token: string;
}

// Journal Models
export enum SentimentType {
  Negative = 0, // For mood ratings 1-2
  Neutral = 1,  // For mood rating 3
  Positive = 2  // For mood ratings 4-5
}

export interface JournalEntry {
  id: string;
  entryText: string;
  moodRating: number;
  tags?: string[];
  isPrivate?: boolean;
  sentiment?: SentimentType;
  dateCreated: Date;
  dateModified?: Date;
  userId?: string;
}

export interface JournalRequestDto {
  entryText: string;
  moodRating: number;
  tags?: string[];
  isPrivate?: boolean;
  sentiment?: SentimentType;
  userId?: string;
}

export interface JournalEntryUpdateDto {
  id: string;
  entryText: string;
  moodRating: number;
  tags?: string[];
  isPrivate?: boolean;
  sentiment?: SentimentType;
} 