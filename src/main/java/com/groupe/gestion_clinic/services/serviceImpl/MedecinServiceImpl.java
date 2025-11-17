package com.groupe.gestion_clinic.services.serviceImpl;

import com.groupe.gestion_clinic.dto.AdressDto;
import com.groupe.gestion_clinic.dto.MedecinDto;
import com.groupe.gestion_clinic.exceptions.NotFoundException;
import com.groupe.gestion_clinic.model.Medecin;
import com.groupe.gestion_clinic.repositories.MedecinRepository;
import com.groupe.gestion_clinic.services.MedecinService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class MedecinServiceImpl implements MedecinService {

    private final MedecinRepository medecinRepository;
    private final PasswordEncoder encoder;

    @Override
    public MedecinDto createMedecin(MedecinDto medecinDto) {
        if(medecinDto == null) {
            return null;
        }
        // encoder le mot de passe avant de l'enregistrer
        if(medecinDto.getMotDePasse() != null) {
            medecinDto.setMotDePasse(encoder.encode(medecinDto.getMotDePasse()));
        }
        Medecin medecin = MedecinDto.toDto(medecinDto);
        return MedecinDto.fromEntity(medecinRepository.save(medecin));
    }

    @Override
    public MedecinDto updateMedecin(Integer id, MedecinDto medecinDto) {

        if(id == null) {
            return null;
        }

        Medecin medecin =
                            medecinRepository.findById(id).orElseThrow(
                                    () -> new NotFoundException("Medecin non trouve")
                            );
        medecin.setNom(medecinDto.getNom());
        medecin.setPrenom(medecinDto.getPrenom());
        medecin.setEmail(medecinDto.getEmail());
        medecin.setRole(medecinDto.getRole());
        medecin.setSpecialite(medecinDto.getSpecialite());
        medecin.setAdresse(AdressDto.toDto(medecinDto.getAdressDto()));


        return MedecinDto.fromEntity(medecinRepository.save(medecin));
    }

    @Override
    public MedecinDto findById(Integer id) {
        return
                medecinRepository
                        .findById(id)
                        .map(MedecinDto::fromEntity)
                        .orElseThrow(
                                ()-> new NotFoundException("aucun Medecin trouvee correspondant a l'ID:  "+id)
                        );
    }

    @Override
    public List<MedecinDto> findAll() {

        List<Medecin>  medecins = medecinRepository.findAll();
        return Optional.of(medecins)
                .filter(elt-> !elt.isEmpty())
                .orElseThrow(
                        ()-> new EntityNotFoundException("EMPTY LIST")
                ).stream()
                .map(MedecinDto::fromEntity)
                .toList();
    }

    @Override
    public MedecinDto deleteMedecin(Integer id) {
        if(id == null) {
            return null;
        }
       Medecin medecin = medecinRepository.findById(id).orElseThrow(()-> new NotFoundException("aucun Medecin trouvee"));
        medecinRepository.delete(medecin);
        return MedecinDto.fromEntity(medecin);
    }
}
