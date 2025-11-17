package com.groupe.gestion_clinic.services;

import com.groupe.gestion_clinic.dto.ChatMessageDto;
import com.groupe.gestion_clinic.dto.requestDto.ChatMessageRequestDto;

import java.util.List;
import java.util.Map;

public interface ChatMesssageService {

    ChatMessageDto saveAndSendMessage(ChatMessageRequestDto requestDto, Integer senderId);
    List<ChatMessageDto> getConversation(Integer user1Id, Integer user2Id);
    void markMessagesAsRead(Integer senderId, Integer receiverId);
    List<ChatMessageDto> getUnreadMessagesForUser(Integer userId);
    Map<Integer, Long> getUnreadMessageCountsBySender(Integer userId);
}
