export type Message = {
  question: string;
  answer: string;
  citations: string[];
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

export type UploadedFileRecord = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
};
