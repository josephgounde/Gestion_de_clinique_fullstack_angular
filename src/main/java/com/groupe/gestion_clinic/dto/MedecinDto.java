package com.groupe.gestion_clinic.dto;

import com.groupe.gestion_clinic.model.Medecin;
import com.groupe.gestion_clinic.model.Role;
import lombok.*;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedecinDto {

    private Integer id;

    private String nom;

    private String prenom;

    private String email;

    private String specialite;

    private String motDePasse;

    private AdressDto adressDto;

    private Role role;

    public static MedecinDto fromEntity(Medecin medecin) {

        if (medecin == null) return null;
        return
                MedecinDto.builder()
                        .nom(medecin.getNom())
                        .id(medecin.getId())
                        .role(medecin.getRole())
                        .specialite(medecin.getSpecialite())
                        .email(medecin.getEmail())
                        .prenom(medecin.getPrenom())
                        .adressDto(AdressDto.fromEntity(medecin.getAdresse()))
                        .build();
    }


    public static Medecin toDto(MedecinDto medecinDto) {

        if (medecinDto == null) return null;
        return
                Medecin.builder()
                        .nom(medecinDto.getNom())
                        .prenom(medecinDto.getPrenom())
                        .role(medecinDto.getRole())
                        .email(medecinDto.getEmail())
                        .motDePasse(medecinDto.getMotDePasse())
                        .adresse(AdressDto.toDto(medecinDto.getAdressDto()))
                        .specialite(medecinDto.getSpecialite())
                        .build();
    }
}
