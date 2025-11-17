package com.groupe.gestion_clinic.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {

    // ex: "NEW_RDV", "RDV_CANCELLED", "RDV_REMINDER"
    private String objMessage;

    private String message;

    // ID du RDV concerné
    private Integer rdvId;

    private LocalDateTime timestamp;

    // ex: "MEDECIN", "SECRETAIRE", "PATIENT"
    private String recipientType;

    // ID du médecin/patient/utilisateur concerné (pour les notifications privées)
    private Long recipientId;

}
