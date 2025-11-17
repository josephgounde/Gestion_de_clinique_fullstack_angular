package com.groupe.gestion_clinic.dto;

import com.groupe.gestion_clinic.dto.requestDto.RendezvousRequestDto;
import com.groupe.gestion_clinic.model.Rendezvous;
import com.groupe.gestion_clinic.model.StatutRendezVous;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RendezvousDto {

    private Integer id;

    private Integer patientId;

    private String patientNom;

    private MedecinDto medecinDTO;

    private LocalDateTime dateHeureDebut;

    private LocalDateTime dateHeureFin;

    private String motif;

    private String salle;

    private StatutRendezVous statut;

    public static RendezvousDto fromEntity(Rendezvous rendezvous) {
        return
                RendezvousDto.builder()
                        .id(rendezvous.getId())
                        .motif(rendezvous.getMotif())
                        .salle(rendezvous.getSalle())
                        .medecinDTO(MedecinDto.fromEntity(rendezvous.getMedecin()))
                        .dateHeureDebut(rendezvous.getDateHeureDebut())
                        .statut(rendezvous.getStatut())
                        .dateHeureFin(rendezvous.getDateHeureFin())
                        .patientId(rendezvous.getPatient().getId()!=null ? rendezvous.getPatient().getId() : null)
                        .patientNom(rendezvous.getPatient().getNom()!=null ? rendezvous.getPatient().getNom() : null)
                        .build();
    }

    public static Rendezvous toDto(RendezvousDto rendezvousDto) {
        return
                Rendezvous
                        .builder()
                        .medecin(MedecinDto.toDto(rendezvousDto.getMedecinDTO()))
                        .dateHeureDebut(rendezvousDto.getDateHeureDebut())
                        .dateHeureFin(rendezvousDto.getDateHeureFin())
                        .salle(rendezvousDto.getSalle())
                        .build();
    }

}
