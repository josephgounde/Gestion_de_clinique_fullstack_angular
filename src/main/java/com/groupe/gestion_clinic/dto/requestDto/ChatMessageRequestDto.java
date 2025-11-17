package com.groupe.gestion_clinic.dto.requestDto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequestDto {
    private Integer senderId;
    private Integer receiverId;
    private String content;
}
