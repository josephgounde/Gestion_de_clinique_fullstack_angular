package com.groupe.gestion_clinic.services;

import com.groupe.gestion_clinic.dto.MedecinDto;
import com.groupe.gestion_clinic.dto.PatientDto;

import java.util.List;

public interface MedecinService {

    MedecinDto createMedecin(MedecinDto medecinDto);
    MedecinDto updateMedecin(Integer id ,MedecinDto medecinDto);
    MedecinDto findById(Integer id);
    List<MedecinDto> findAll();
    MedecinDto deleteMedecin(Integer id);
}
