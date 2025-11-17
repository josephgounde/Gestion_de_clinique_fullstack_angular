export interface ChatMessageRequestDto {
  receiverId: number;
  content: string;
}

export interface ChatMessageDto {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
  senderName?: string;
  receiverName?: string;
}

export interface UnreadMessageCounts {
  [senderId: number]: number;
} 