package com.groupe.gestion_clinic.repositories;

import com.groupe.gestion_clinic.model.Medecin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedecinRepository extends JpaRepository<Medecin, Integer> {
    // Méthodes pour la recherche
    List<Medecin> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(String nom, String prenom);
}
