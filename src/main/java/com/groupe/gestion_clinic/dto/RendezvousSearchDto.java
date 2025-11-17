package com.groupe.gestion_clinic.dto;

import lombok.*;

import java.time.LocalDate;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RendezvousSearchDto {
    private Long medecinId;
    private LocalDate date;
    private String salle;
    private String statut;
}
