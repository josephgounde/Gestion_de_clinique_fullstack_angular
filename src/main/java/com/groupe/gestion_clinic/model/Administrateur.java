package com.groupe.gestion_clinic.model;


import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@DiscriminatorValue("ADMIN")
@NoArgsConstructor
public class Administrateur extends Utilisateur {


}
