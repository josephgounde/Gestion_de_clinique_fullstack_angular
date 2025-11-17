package com.groupe.gestion_clinic.model;


import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Patient extends AbstractEntity{

    private String nom;

    private String prenom;

    private String email;

    private LocalDate dateNaissance;

    private String telephone;

    private String antecedents;

    private String allergies;

    private String avatarUrl;

    @Embedded
    private Adresse adresse;

    @OneToMany(mappedBy = "patient")
    private List<Rendezvous> rendezvouses;

}
