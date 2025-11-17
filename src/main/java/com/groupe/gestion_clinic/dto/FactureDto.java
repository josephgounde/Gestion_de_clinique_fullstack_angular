package com.groupe.gestion_clinic.dto;


import com.groupe.gestion_clinic.model.Facture;
import com.groupe.gestion_clinic.model.StatutFacture;
import lombok.*;

import java.time.LocalDate;
import java.util.List;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FactureDto {

    private Integer id;

    private Double montantTotal;

    private LocalDate dateEcheance;

    private StatutFacture statut;

    private String numeroFacture;
    
    private java.time.LocalDateTime createdAt;
    
    private String patientNom;

    private List<PrescriptionDto> prescriptionDtos;

    public static FactureDto fromEntity(Facture facture) {
        String patientNom = "";
        if (!facture.getPrescription().isEmpty() && 
            facture.getPrescription().get(0).getRendezvous() != null &&
            facture.getPrescription().get(0).getRendezvous().getPatient() != null) {
            var patient = facture.getPrescription().get(0).getRendezvous().getPatient();
            patientNom = patient.getPrenom() + " " + patient.getNom();
        }
        
        return FactureDto.builder()
                .id(facture.getId())
                .numeroFacture(facture.getNumeroFacture())
                .dateEcheance(facture.getDateEcheance())
                .montantTotal(facture.getMontantTotal())
                .statut(facture.getStatut())
                .createdAt(facture.getCreatedAt())
                .patientNom(patientNom)
                .prescriptionDtos(facture.getPrescription() != null ? 
                    facture.getPrescription().stream().map(PrescriptionDto::fromEntity).toList() : 
                    new java.util.ArrayList<>())
                .build();
    }
}
