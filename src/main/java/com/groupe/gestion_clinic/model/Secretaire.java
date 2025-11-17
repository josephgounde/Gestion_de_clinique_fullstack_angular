package com.groupe.gestion_clinic.model;


import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Getter
@Setter
@SuperBuilder
@DiscriminatorValue("SECRETAIRE")
@NoArgsConstructor
@AllArgsConstructor
public class Secretaire extends Utilisateur {

    @Embedded
    private Adresse adresse;

    @OneToMany(mappedBy = "secretaire")
    private List<Rendezvous> rendezvousList;
}
