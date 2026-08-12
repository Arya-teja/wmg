import api from "@/lib/axios";

export type ChatRole = "user" | "model";

export interface ChatHistoryItem {
  role: ChatRole;
  content: string;
}

export interface ChatRequestPayload {
  message: string;
  history: ChatHistoryItem[];
}

export interface ChatResponse {
  reply: string;
}

export const chatService = {
  // Mengirim pesan user beserta riwayat percakapan ke AI assistant.
  // Endpoint ini publik (tidak butuh auth/token).
  async sendMessage(payload: ChatRequestPayload): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>("/chat", payload);
    return response.data;
  },
};
