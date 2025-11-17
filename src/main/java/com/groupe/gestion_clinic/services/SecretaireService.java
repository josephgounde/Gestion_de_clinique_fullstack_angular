package com.groupe.gestion_clinic.services;

import com.groupe.gestion_clinic.dto.SecretaireDto;

import java.util.List;

public interface SecretaireService {

    SecretaireDto createSecretaire(SecretaireDto secretaireDto);
    SecretaireDto updateSecretaire(Integer id, SecretaireDto secretaireDto);
    SecretaireDto findById(Integer id);
    List<SecretaireDto> findAll();
    SecretaireDto deleteSecretaire(Integer id);
}
