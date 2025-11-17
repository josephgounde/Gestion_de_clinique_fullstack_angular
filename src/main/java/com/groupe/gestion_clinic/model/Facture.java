package com.groupe.gestion_clinic.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Facture extends AbstractEntity{


    private String numeroFacture;

    @Column(nullable = false)
    private Double montantTotal;

    private Double fraisConsultation;
    private Double fraisHospitalisation;
    private Double fraisExamen;

    private LocalDate dateEcheance;

    @Column(name = "idEntreprise")
    private Integer idEntreprise;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutFacture statut;

    @OneToMany(mappedBy = "facture")
    private List<Prescription> prescription;
}
