package com.groupe.gestion_clinic.dto.requestDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDto {
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private String motDePasse;
    private String specialite; // Pour les médecins
}