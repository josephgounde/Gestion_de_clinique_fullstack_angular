package com.groupe.gestion_clinic.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Embeddable
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Adresse {

    private String street ;

    private String houseNumber ;

    private Integer postalCode ;

    private String city ;

    private String country ;
}
