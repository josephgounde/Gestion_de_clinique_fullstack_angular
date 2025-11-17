package com.groupe.gestion_clinic.services;

import com.groupe.gestion_clinic.dto.PatientDto;
import com.groupe.gestion_clinic.dto.PatientHistoryDto;
import com.groupe.gestion_clinic.dto.PrescriptionDto;

import java.util.List;
import java.util.Optional;

public interface PatientService {
    PatientDto createPatient(PatientDto patientDto);
    PatientDto updatePatient(Integer id ,PatientDto patientDto);
    PatientDto findById(Integer id);
    List<PatientDto> findAll();
    PatientDto deletePatient(Integer id);

    List<PrescriptionDto> getPatientPrescriptionsHistory(Integer patientId);
    PatientHistoryDto getPatientHistory(Integer patientId);
    byte[] generatePatientHistoryPdf(Integer patientId);

}
