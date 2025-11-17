package com.groupe.gestion_clinic.dto;


import com.groupe.gestion_clinic.model.ChatMessage;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {
    private Integer id;
    private Integer senderId;
    private String senderName;
    private Integer receiverId;
    private String receiverName;
    private String content;
    private LocalDateTime timestamp;
    private Boolean isRead;

    public static ChatMessageDto fromEntity(ChatMessage chatMessage) {
        return ChatMessageDto.builder()
                .id(chatMessage.getId())
                .senderId(chatMessage.getSender() != null ? chatMessage.getSender().getId() : null)
                .senderName(chatMessage.getSender() != null ? chatMessage.getSender().getNom() : null)
                .receiverId(chatMessage.getReceiver() != null ? chatMessage.getReceiver().getId() : null)
                .receiverName(chatMessage.getReceiver() != null ? chatMessage.getReceiver().getNom() : null)
                .content(chatMessage.getContent())
                .timestamp(chatMessage.getTimestamp())
                .isRead(chatMessage.getIsRead())
                .build();
    }
}
