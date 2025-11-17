package com.groupe.gestion_clinic.dto.requestDto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Duration;
import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RendezvousRequestDto {

    @NotNull
    private Integer patientId;

    @NotNull
    private Integer medecinId;

    @Future
    @NotNull
    private LocalDateTime dateHeureDebut;

    @NotNull
    private Duration duree;

    private String motif;

    private String salle;
}
