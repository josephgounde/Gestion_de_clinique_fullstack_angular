package com.groupe.gestion_clinic.controllers;


import com.groupe.gestion_clinic.dto.ChatMessageDto;
import com.groupe.gestion_clinic.dto.requestDto.ChatMessageRequestDto;
import com.groupe.gestion_clinic.services.ChatMesssageService;
import com.groupe.gestion_clinic.services.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


/*
* @Controller pour les contrôleurs STOMP
* @RestController Nécessaire pour des endpoints REST
* */
@Controller
@RequiredArgsConstructor
@RequestMapping("/api/chat")
@RestController
public class ChatMessageController {

    private final ChatMesssageService chatMessageService;

    // Pour récupérer l'ID de l'utilisateur authentifié
    private final UtilisateurService utilisateurService;

    /*
    * Endpoint pour envoyer un message (via WebSocket)
    * Les messages seront envoyés à /app/chat.sendMessage (préfixe /app défini dans WebSocketConfig)
    * */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageRequestDto chatMessageRequest) {
        System.out.println("Message reçu via WebSocket: " + chatMessageRequest);
        
        try {
            // Utiliser l'ID de l'expéditeur depuis le DTO
            Integer senderId = chatMessageRequest.getSenderId();
            System.out.println("Sender ID: " + senderId);
            
            if (senderId != null) {
                chatMessageService.saveAndSendMessage(chatMessageRequest, senderId);
                System.out.println("Message traité avec succès");
            } else {
                System.err.println("Sender ID manquant dans le message");
            }
        } catch (Exception e) {
            System.err.println("Erreur lors du traitement du message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Endpoint pour marquer les messages comme lus (via WebSocket)
    @MessageMapping("/chat.markAsRead")
    public void markAsRead(@Payload Map<String, Integer> payload,
                           @AuthenticationPrincipal UserDetails userDetails) {
        Integer senderToMarkRead = payload.get("senderId");
        Integer currentUserId = utilisateurService.getUtilisateurByEmail(userDetails.getUsername()).getId();
        if (senderToMarkRead != null) {
            chatMessageService.markMessagesAsRead(senderToMarkRead, currentUserId);
        }
    }

    /*
    * Endpoint REST pour récupérer l'historique d'une conversation (pour l'initialisation du chat)
    * */
    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<List<ChatMessageDto>> getConversation(@PathVariable Integer otherUserId,
                                                                @AuthenticationPrincipal UserDetails userDetails) {
        System.out.println("=== GET CONVERSATION ===");
        System.out.println("Other User ID: " + otherUserId);
        System.out.println("UserDetails: " + (userDetails != null ? userDetails.getUsername() : "null"));
        
        try {
            if (userDetails == null) {
                System.out.println("UserDetails null, retour liste vide");
                return ResponseEntity.ok(List.of());
            }
            Integer currentUserId = utilisateurService.getUtilisateurByEmail(userDetails.getUsername()).getId();
            System.out.println("Current User ID: " + currentUserId);
            
            List<ChatMessageDto> conversation = chatMessageService.getConversation(currentUserId, otherUserId);
            System.out.println("Messages trouvés: " + (conversation != null ? conversation.size() : 0));
            
            return ResponseEntity.ok(conversation != null ? conversation : List.of());
        } catch (Exception e) {
            System.err.println("Erreur getConversation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }


    // Endpoint REST pour récupérer les messages non lus de l'utilisateur actuel
    @GetMapping("/unread")
    public ResponseEntity<List<ChatMessageDto>> getUnreadMessages(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.ok(List.of());
            }
            Integer currentUserId = utilisateurService.getUtilisateurByEmail(userDetails.getUsername()).getId();
            List<ChatMessageDto> unreadMessages = chatMessageService.getUnreadMessagesForUser(currentUserId);
            return ResponseEntity.ok(unreadMessages != null ? unreadMessages : List.of());
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    // Endpoint REST pour récupérer le nombre de messages non lus par expéditeur
    @GetMapping("/unread/counts")
    public ResponseEntity<Map<Integer, Long>> getUnreadMessageCounts(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.ok(Map.of());
            }
            Integer currentUserId = utilisateurService.getUtilisateurByEmail(userDetails.getUsername()).getId();
            Map<Integer, Long> counts = chatMessageService.getUnreadMessageCountsBySender(currentUserId);
            return ResponseEntity.ok(counts != null ? counts : Map.of());
        } catch (Exception e) {
            // Retourner une map vide en cas d'erreur plutôt qu'une erreur 500
            return ResponseEntity.ok(Map.of());
        }
    }

    // Endpoint REST pour marquer les messages comme lus (fallback HTTP)
    @PutMapping("/mark-read/{senderId}")
    public ResponseEntity<Void> markAsReadHttp(@PathVariable Integer senderId,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.ok().build();
            }
            Integer currentUserId = utilisateurService.getUtilisateurByEmail(userDetails.getUsername()).getId();
            chatMessageService.markMessagesAsRead(senderId, currentUserId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Erreur markAsReadHttp: " + e.getMessage());
            return ResponseEntity.ok().build();
        }
    }

    // Endpoint de test pour vérifier les messages en base
    @GetMapping("/test/conversation/{user1Id}/{user2Id}")
    public ResponseEntity<List<ChatMessageDto>> testGetConversation(@PathVariable Integer user1Id, @PathVariable Integer user2Id) {
        System.out.println("=== TEST CONVERSATION ===");
        System.out.println("User1 ID: " + user1Id + ", User2 ID: " + user2Id);
        
        try {
            List<ChatMessageDto> conversation = chatMessageService.getConversation(user1Id, user2Id);
            System.out.println("Messages trouvés (test): " + (conversation != null ? conversation.size() : 0));
            return ResponseEntity.ok(conversation != null ? conversation : List.of());
        } catch (Exception e) {
            System.err.println("Erreur test conversation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }



}
