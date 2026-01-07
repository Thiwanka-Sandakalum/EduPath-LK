export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp?: Date | string; // Made optional/flexible for compatibility
  relatedLinks?: { text: string; url: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[];
}
