package com.groupe.gestion_clinic.dto;

import com.groupe.gestion_clinic.model.Patient;
import com.groupe.gestion_clinic.model.Prescription;
import lombok.*;

import java.time.LocalDate;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDto {

    private Integer id;

    private String posologie;

    private String dosage;

    private String medicament;

    private LocalDate prescriptionDate;

    private Boolean effective;

    private Integer rendezvousId;

    private Integer factureId;
    
    private Boolean hospitalisationNecessaire;
    
    private String examensNecessaires;
    
    private String patientNom;
    
    private String patientPrenom;
    
    private String medecinNom;
    
    private String medecinPrenom;
    
    private String motifConsultation;
    
    private String dateCreation;

    public static PrescriptionDto fromEntity(Prescription prescription) {
        PrescriptionDto.PrescriptionDtoBuilder builder = PrescriptionDto.builder()
                .id(prescription.getId())
                .dosage(prescription.getDosage())
                .posologie(prescription.getPosologie())
                .medicament(prescription.getMedicament())
                .prescriptionDate(prescription.getPrescriptionDate())
                .effective(prescription.getEffective())
                .hospitalisationNecessaire(prescription.getHospitalisationNecessaire())
                .examensNecessaires(prescription.getExamensNecessaires());
                
        if (prescription.getRendezvous() != null) {
            builder.rendezvousId(prescription.getRendezvous().getId());
            builder.motifConsultation(prescription.getRendezvous().getMotif());
            
            if (prescription.getRendezvous().getPatient() != null) {
                builder.patientNom(prescription.getRendezvous().getPatient().getNom());
                builder.patientPrenom(prescription.getRendezvous().getPatient().getPrenom());
            }
            
            if (prescription.getRendezvous().getMedecin() != null) {
                builder.medecinNom(prescription.getRendezvous().getMedecin().getNom());
                builder.medecinPrenom(prescription.getRendezvous().getMedecin().getPrenom());
            }
        }
        
        if (prescription.getFacture() != null) {
            builder.factureId(prescription.getFacture().getId());
        }
        
        if (prescription.getCreatedAt() != null) {
            builder.dateCreation(prescription.getCreatedAt().toString());
        }
        
        return builder.build();
    }


}
