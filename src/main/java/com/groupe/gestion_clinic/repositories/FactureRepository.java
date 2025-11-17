package com.groupe.gestion_clinic.repositories;

import com.groupe.gestion_clinic.model.Facture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FactureRepository extends JpaRepository<Facture, Integer> {

    // Trouver toutes les factures qui contiennent au moins une prescription avec un ID donné
    //Optional<Facture> findByPrescriptions_Id(Integer prescriptionId);

    //List<Facture> findByDateEmissionBetween(LocalDate startDate, LocalDate endDate);
}
