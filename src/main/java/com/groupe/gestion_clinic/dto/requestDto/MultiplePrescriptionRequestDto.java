package com.groupe.gestion_clinic.dto.requestDto;

import lombok.Data;
import java.util.List;

@Data
public class MultiplePrescriptionRequestDto {
    private Integer rendezvousId;
    private String prescriptionDate;
    private Boolean effective;
    private Boolean hospitalisationNecessaire;
    private String examensNecessaires;
    private List<MedicamentDto> medicaments;
    
    @Data
    public static class MedicamentDto {
        private String medicament;
        private String posologie;
        private String dosage;
    }
}