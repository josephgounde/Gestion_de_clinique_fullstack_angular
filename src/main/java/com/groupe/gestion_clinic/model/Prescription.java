package com.groupe.gestion_clinic.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Prescription extends AbstractEntity{

    @Column(columnDefinition = "TEXT")
    private String posologie;

    private String dosage;

    private String medicament;

    private LocalDate prescriptionDate;

    // Indique si la prescription est toujours valide ou a été utilisée/traitée
    private Boolean effective;

    private Boolean hospitalisationNecessaire;

    @Column(columnDefinition = "TEXT")
    private String examensNecessaires;

    // @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    // @Column(nullable = false)
    // private StatutFacturation statutFacturation = StatutFacturation.NON_FACTUREE;

    @ManyToOne
    @JoinColumn(name = "rendezvousId")
    private Rendezvous rendezvous;

    @ManyToOne
    @JoinColumn(name = "factureId")
    private Facture facture;


}
