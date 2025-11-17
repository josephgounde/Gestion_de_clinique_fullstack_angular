package com.groupe.gestion_clinic.services.serviceImpl;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.groupe.gestion_clinic.dto.AdressDto;
import com.groupe.gestion_clinic.dto.SecretaireDto;
import com.groupe.gestion_clinic.exceptions.NotFoundException;
import com.groupe.gestion_clinic.model.Secretaire;
import com.groupe.gestion_clinic.repositories.SecretaireRepository;
import com.groupe.gestion_clinic.services.SecretaireService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SecretaireServiceImpl implements SecretaireService {

    private final SecretaireRepository secretaireRepository;
    private final PasswordEncoder encoder;


    @Override
    public SecretaireDto createSecretaire(SecretaireDto secretaireDto) {
        if(secretaireDto == null) {
            return null;
        }

        // encoder le mot de passe avant de l'enregistrer
        if(secretaireDto.getMotDePasse() != null) {
            secretaireDto.setMotDePasse(encoder.encode(secretaireDto.getMotDePasse()));
        }

        Secretaire secretaire = SecretaireDto.toDto(secretaireDto);
        return SecretaireDto.fromEntity(secretaireRepository.save(secretaire));
    }

    @Override
    public SecretaireDto updateSecretaire(Integer id, SecretaireDto secretaireDto) {
        if(id == null ) {return null;}
        Secretaire secretaire = secretaireRepository.findById(id).orElseThrow(()-> new NotFoundException("Secretaire non trouvee"));
        secretaire.setNom(secretaireDto.getNom());
        secretaire.setPrenom(secretaireDto.getPrenom());
        secretaire.setEmail(secretaireDto.getEmail());
        secretaire.setRole(secretaireDto.getRole());
        secretaire.setAdresse(AdressDto.toDto(secretaireDto.getAdressDto()));

        return SecretaireDto.fromEntity(secretaireRepository.save(secretaire));
    }

    @Override
    public SecretaireDto findById(Integer id) {
        return secretaireRepository.findById(id)
                .map(SecretaireDto::fromEntity)
                .orElseThrow(() -> new NotFoundException("Secretaire non trouvé avec ID " + id));
    }

    @Override
    public List<SecretaireDto> findAll() {
        List<Secretaire> secretaireList  = secretaireRepository.findAll();
       /**  return Optional.of(secretaireList)
                .filter(l -> !secretaireList.isEmpty())
                .orElseThrow(() -> new EntityNotFoundException("EMPTY LIST"))
                .stream()
                .map(SecretaireDto::fromEntity)
                .toList();
                */
        //the best practice is that a findall method should only return a list of the mapped DTOs/an empty list if there is no data        
            return secretaireList.stream()
                .map(SecretaireDto::fromEntity)
                .toList();    
    }

    @Override
    public SecretaireDto deleteSecretaire(Integer id) {
        Secretaire secretaire = secretaireRepository.findById(id).orElseThrow(() -> new NotFoundException("Secretaire introuvable"));
        secretaireRepository.delete(secretaire);
        return SecretaireDto.fromEntity(secretaire);
    }
}
