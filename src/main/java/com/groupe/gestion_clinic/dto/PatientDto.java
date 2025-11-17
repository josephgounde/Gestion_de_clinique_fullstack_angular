package com.groupe.gestion_clinic.dto;

import com.groupe.gestion_clinic.model.Patient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDate;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDto {

    private Integer id;

    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @Email
    private String email;

    @PastOrPresent
    private LocalDate dateNaissance;

    @Pattern(regexp = "[0-9]{8,12}",message = "Le numéro de téléphone doit contenir entre 8 et 12 chiffres")
    private String telephone;

    private String antecedents;

    private String allergies;

    private AdressDto adressDto;

    //private List<RendezvousDto> rendezvousesDto;


    public static PatientDto fromEntity(Patient patient) {
        return
                PatientDto
                        .builder()
                        .nom(patient.getNom())
                        .id(patient.getId())
                        .prenom(patient.getPrenom())
                        .email(patient.getEmail())
                        .telephone(patient.getTelephone())
                        .allergies(patient.getAllergies())
                        .antecedents(patient.getAntecedents())
                        .dateNaissance(patient.getDateNaissance())
                        .adressDto(AdressDto.fromEntity(patient.getAdresse()))
                        .build();

    }

    public static Patient toEntity(PatientDto patientDto) {
        return
                Patient
                        .builder()
                        .nom(patientDto.getNom())
                        .prenom(patientDto.getPrenom())
                        .email(patientDto.getEmail())
                        .telephone(patientDto.getTelephone())
                        .allergies(patientDto.getAllergies())
                        .antecedents(patientDto.getAntecedents())
                        .dateNaissance(patientDto.getDateNaissance())
                        .adresse(AdressDto.toDto(patientDto.getAdressDto()))
                        .build();

    }


}
