package com.groupe.gestion_clinic.repositories;

import com.groupe.gestion_clinic.model.Rendezvous;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RendezvousRepository extends JpaRepository<Rendezvous, Integer> , JpaSpecificationExecutor<Rendezvous> {

// verifier si un médecin a des rendez-vous non annulés qui se chevauchent avec la plage horaire [start, end]
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
            "FROM Rendezvous r " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.statut <> com.groupe.gestion_clinic.model.StatutRendezVous.ANNULE " +
            "AND ((r.dateHeureDebut < :end AND r.dateHeureFin > :start))")
    boolean existsConflictingMedecinRendezVous(
                                                @Param("medecinId") Integer medecinId,
                                                @Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end);

/*
    verifier si un patient a des rendez-vous non annulés prévus dans un intervale de temps
     pour le jour spécifié [heureJourDebut,heureJourFin]
 */
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
            "FROM Rendezvous r " +
            "WHERE r.patient.id = :patientId " +
            "AND r.statut <> com.groupe.gestion_clinic.model.StatutRendezVous.ANNULE " +
            "AND r.dateHeureDebut BETWEEN :startOfDay AND :endOfDay")
    boolean existsByPatientAndDate(
                                    @Param("patientId") Integer patientId,
                                    @Param("startOfDay") LocalDateTime startOfDay,
                                    @Param("endOfDay") LocalDateTime endOfDay);


/*   selectionner la liste des rendezvous de  tous les medecins ou pour un medecin specifique
     par ordre chronologique sur une periode definie
 */
    @Query("SELECT r FROM Rendezvous r " +
            "WHERE (:medecinId IS NULL OR r.medecin.id = :medecinId) " +
            "AND r.dateHeureDebut BETWEEN :start AND :end " +
            "ORDER BY r.dateHeureDebut")
    List<Rendezvous> findAllByMedecinAndPeriod(
                                                @Param("medecinId") Integer medecinId,
                                                @Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end);

/*
    afficher tous les rendevous qui ont le statut PLANIFIER qui se trouve entre une date initiale et une date future
* */
    @Query("SELECT r FROM Rendezvous r " +
            "WHERE r.dateHeureDebut BETWEEN :now AND :futureDate " +
            "AND r.statut = com.groupe.gestion_clinic.model.StatutRendezVous.PLANIFIE")
    List<Rendezvous> findUpcomingRendezVous(
                                            @Param("now") LocalDateTime now,
                                            @Param("futureDate") LocalDateTime futureDate);

    // Nouvelles méthodes pour le dashboard
    @Query("SELECT COUNT(r) FROM Rendezvous r WHERE DATE(r.dateHeureDebut) = :date")
    long countByDateRendezVous(@Param("date") LocalDate date);

    @Query("SELECT COUNT(r) FROM Rendezvous r WHERE r.statut = :statut")
    long countByStatut(@Param("statut") String statut);

    @Query("SELECT r FROM Rendezvous r ORDER BY r.dateHeureDebut DESC LIMIT 10")
    List<Rendezvous> findRecentRendezVous();
    
    List<Rendezvous> findAllByOrderByCreatedAtDesc();
    
    org.springframework.data.domain.Page<Rendezvous> findAllByOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);
    
    List<Rendezvous> findByPatientIdOrderByDateHeureDebutDesc(Integer patientId);
    
}
