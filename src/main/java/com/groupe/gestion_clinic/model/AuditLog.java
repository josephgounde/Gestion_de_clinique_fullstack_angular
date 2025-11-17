package com.groupe.gestion_clinic.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog extends AbstractEntity {

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String utilisateurEmail;

    @Column(nullable = false)
    private String utilisateurRole;

    private String details;

    @Column(nullable = false)
    private LocalDateTime dateAction;

    private String adresseIP;

    @PrePersist
    public void prePersist() {
        if (dateAction == null) {
            dateAction = LocalDateTime.now();
        }
    }
}