export interface Goal {
  id: string;
  task: string;
  startTime: string;
  endTime: string;
  status: "completed" | "half" | "not" | "pending";
  subject: "Physics" | "Chemistry" | "Mathematics" | "Other";
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  imageBase64?: string;
  mimeType?: string;
}
