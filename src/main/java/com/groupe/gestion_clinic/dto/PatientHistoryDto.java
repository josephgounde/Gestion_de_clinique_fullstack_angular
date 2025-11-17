package com.groupe.gestion_clinic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientHistoryDto {
    private PatientDto patient;
    private List<RendezvousDto> rendezvous;
    private List<PrescriptionDto> prescriptions;
    private int totalConsultations;
    private String lastConsultationDate;
}