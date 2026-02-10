// utils/types.ts
export interface User {
  id: string;
  email: string | null;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: string;
}