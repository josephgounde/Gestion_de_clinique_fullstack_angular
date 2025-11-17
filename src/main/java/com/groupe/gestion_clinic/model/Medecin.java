package com.groupe.gestion_clinic.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;


@Entity
@Data
@SuperBuilder
@DiscriminatorValue("MEDECIN")
@NoArgsConstructor
@AllArgsConstructor
public class Medecin extends Utilisateur{

    private String specialite;

    @Embedded
    private Adresse adresse;


    @OneToMany(mappedBy = "medecin")
    private List<Rendezvous> rendezvous;

}
