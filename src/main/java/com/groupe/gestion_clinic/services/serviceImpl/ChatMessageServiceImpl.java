package com.groupe.gestion_clinic.services.serviceImpl;

import com.groupe.gestion_clinic.dto.ChatMessageDto;
import com.groupe.gestion_clinic.dto.requestDto.ChatMessageRequestDto;
import com.groupe.gestion_clinic.exceptions.NotFoundException;
import com.groupe.gestion_clinic.model.ChatMessage;
import com.groupe.gestion_clinic.model.Utilisateur;
import com.groupe.gestion_clinic.repositories.ChatMessageRepository;
import com.groupe.gestion_clinic.repositories.UtilisateurRepository;
import com.groupe.gestion_clinic.services.ChatMesssageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatMessageServiceImpl implements ChatMesssageService {
    private final ChatMessageRepository chatMessageRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public ChatMessageDto saveAndSendMessage(ChatMessageRequestDto requestDto, Integer senderId) {

        // Vérification et recuperation de l'expéditeur et du destinataire
        Utilisateur sender = utilisateurRepository.findById(senderId)
                .orElseThrow(() -> new NotFoundException("Expéditeur non trouvé avec l'ID: " + senderId));
        Utilisateur receiver = utilisateurRepository.findById(requestDto.getReceiverId())
                .orElseThrow(() -> new NotFoundException("Destinataire non trouvé avec l'ID: " + requestDto.getReceiverId()));

        // Création du message
        ChatMessage chatMessage = ChatMessage.builder()
                .sender(sender)
                .receiver(receiver)
                .content(requestDto.getContent())
                .timestamp(LocalDateTime.now())
                .isRead(false) // Non lu par défaut
                .build();

        ChatMessageDto chatMessageDto = ChatMessageDto.fromEntity(chatMessageRepository.save(chatMessage));

    /*
        on envoi le message via WebSocket au destinataire
        "/user/{receiverId}/queue/messages" est le préfixe pour les messages privés (défini dans WebSocketConfig)
     */
        messagingTemplate.convertAndSendToUser(
                receiver.getEmail(), // Utilise l'email comme nom d'utilisateur pour la destination /user
                "/queue/messages",
                chatMessageDto
        );


        // on renvoi le message  au sender pour mise à jour immédiate de son interface
        messagingTemplate.convertAndSendToUser(
                sender.getEmail(),
                "/queue/messages",
                chatMessageDto
        );

        return chatMessageDto;
    }

    @Override
    public List<ChatMessageDto> getConversation(Integer user1Id, Integer user2Id) {
        System.out.println("ChatMessageService.getConversation - User1: " + user1Id + ", User2: " + user2Id);
        
        List<ChatMessage> messages = chatMessageRepository.findConversationBetweenUsers(user1Id, user2Id);
        System.out.println("Messages bruts trouvés: " + messages.size());
        
        List<ChatMessageDto> result = messages.stream()
                .map(ChatMessageDto::fromEntity)
                .collect(Collectors.toList());
        
        System.out.println("Messages DTO créés: " + result.size());
        return result;
    }

    @Override
    @Transactional
    public void markMessagesAsRead(Integer senderId, Integer receiverId) {
        chatMessageRepository.markMessagesAsRead(senderId, receiverId);
    }

    @Override
    public List<ChatMessageDto> getUnreadMessagesForUser(Integer userId) {
        return chatMessageRepository.findByReceiverIdAndIsReadFalse(userId).stream()
                .map(ChatMessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public Map<Integer, Long> getUnreadMessageCountsBySender(Integer userId) {
        List<Object[]> results = chatMessageRepository.countUnreadMessagesBySender(userId);
        return results.stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0], // Sender ID
                        row -> (Long) row[1]    // Count
                ));
    }

}
