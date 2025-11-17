package com.groupe.gestion_clinic.controllers;

import com.groupe.gestion_clinic.dto.MedecinDto;
import com.groupe.gestion_clinic.dto.SecretaireDto;
import com.groupe.gestion_clinic.dto.UserResponseDto;
import com.groupe.gestion_clinic.dto.requestDto.UserRequestDto;
import com.groupe.gestion_clinic.services.MedecinService;
import com.groupe.gestion_clinic.services.SecretaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4203"})
@RequiredArgsConstructor
public class UsersController {
    
    private final MedecinService medecinService;
    private final SecretaireService secretaireService;

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> allUsers = new ArrayList<>();
        
        List<MedecinDto> medecins = medecinService.findAll();
        for (MedecinDto medecin : medecins) {
            UserResponseDto user = new UserResponseDto();
            user.setId(medecin.getId());
            user.setNom(medecin.getNom());
            user.setPrenom(medecin.getPrenom());
            user.setEmail(medecin.getEmail());
            user.setRole("MEDECIN");
            allUsers.add(user);
        }
        
        List<SecretaireDto> secretaires = secretaireService.findAll();
        for (SecretaireDto secretaire : secretaires) {
            UserResponseDto user = new UserResponseDto();
            user.setId(secretaire.getId());
            user.setNom(secretaire.getNom());
            user.setPrenom(secretaire.getPrenom());
            user.setEmail(secretaire.getEmail());
            user.setRole("SECRETAIRE");
            allUsers.add(user);
        }
        
        return ResponseEntity.ok(allUsers);
    }

    @PostMapping
    public ResponseEntity<Object> createUser(@RequestBody UserRequestDto userDto) {
        try {
            if ("MEDECIN".equals(userDto.getRole())) {
                MedecinDto medecinDto = new MedecinDto();
                medecinDto.setNom(userDto.getNom());
                medecinDto.setPrenom(userDto.getPrenom());
                medecinDto.setEmail(userDto.getEmail());
                medecinDto.setMotDePasse(userDto.getMotDePasse());
                medecinDto.setSpecialite(userDto.getSpecialite());
                medecinDto.setRole(com.groupe.gestion_clinic.model.Role.MEDECIN);
                
                MedecinDto created = medecinService.createMedecin(medecinDto);
                return ResponseEntity.ok(created);
                
            } else if ("SECRETAIRE".equals(userDto.getRole())) {
                SecretaireDto secretaireDto = new SecretaireDto();
                secretaireDto.setNom(userDto.getNom());
                secretaireDto.setPrenom(userDto.getPrenom());
                secretaireDto.setEmail(userDto.getEmail());
                secretaireDto.setMotDePasse(userDto.getMotDePasse());
                secretaireDto.setRole(com.groupe.gestion_clinic.model.Role.SECRETAIRE);
                
                SecretaireDto created = secretaireService.createSecretaire(secretaireDto);
                return ResponseEntity.ok(created);
            }
            
            return ResponseEntity.badRequest().body("Rôle non supporté");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la création: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateUser(@PathVariable Integer id, @RequestBody UserRequestDto userDto) {
        try {
            if ("MEDECIN".equals(userDto.getRole())) {
                MedecinDto medecinDto = new MedecinDto();
                medecinDto.setNom(userDto.getNom());
                medecinDto.setPrenom(userDto.getPrenom());
                medecinDto.setEmail(userDto.getEmail());
                if (userDto.getSpecialite() != null) {
                    medecinDto.setSpecialite(userDto.getSpecialite());
                }
                
                MedecinDto updated = medecinService.updateMedecin(id, medecinDto);
                return ResponseEntity.ok(updated);
                
            } else if ("SECRETAIRE".equals(userDto.getRole())) {
                SecretaireDto secretaireDto = new SecretaireDto();
                secretaireDto.setNom(userDto.getNom());
                secretaireDto.setPrenom(userDto.getPrenom());
                secretaireDto.setEmail(userDto.getEmail());
                
                SecretaireDto updated = secretaireService.updateSecretaire(id, secretaireDto);
                return ResponseEntity.ok(updated);
            }
            
            return ResponseEntity.badRequest().body("Rôle non supporté");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la modification: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        try {
            try {
                medecinService.deleteMedecin(id);
                return ResponseEntity.ok().build();
            } catch (Exception e) {
                secretaireService.deleteSecretaire(id);
                return ResponseEntity.ok().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}