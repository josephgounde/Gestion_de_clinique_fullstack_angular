package com.groupe.gestion_clinic.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Rendezvous extends AbstractEntity {


    private LocalDateTime dateHeureDebut;

    private LocalDateTime dateHeureFin;

    private LocalDateTime dateAnnulation;

    private String motif;

    private String salle;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private StatutRendezVous statut;


    @ManyToOne
    @JoinColumn(name = "patientId")
    private Patient patient;

    @OneToMany(mappedBy = "rendezvous")
    private List<Prescription> prescription;

    @ManyToOne
    @JoinColumn(name = "secretaireId")
    private Secretaire secretaire;

    @ManyToOne
    @JoinColumn(name = "medecinId")
    private Medecin medecin;
}
