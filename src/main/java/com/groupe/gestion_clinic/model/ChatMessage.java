package com.groupe.gestion_clinic.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;


@Data
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage extends AbstractEntity{


    // L'expéditeur du message (peut être un Médecin ou une Secrétaire)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Utilisateur sender;

    // Le destinataire du message (peut être un Médecin ou une Secrétaire)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private Utilisateur receiver;

    // Le contenu du message
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // L'horodatage du message
    @Column(nullable = false)
    private LocalDateTime timestamp;

    // Indique si le message a été lu par le destinataire
    @Column(nullable = false)
    private Boolean isRead;

    @Enumerated(EnumType.STRING)
    private ChatMessageStatut chatStatus;


}
