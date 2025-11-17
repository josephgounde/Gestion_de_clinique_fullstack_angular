package com.groupe.gestion_clinic.repositories;

import com.groupe.gestion_clinic.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {
    
    boolean existsByRendezvousIdAndMedicamentAndDosageAndPosologie(
            Integer rendezvousId, String medicament, String dosage, String posologie);
    
    List<Prescription> findByRendezvousId(Integer rendezvousId);
    
    List<Prescription> findAllByOrderByCreatedAtDesc();
    
    List<Prescription> findByRendezvousMedecinIdOrderByCreatedAtDesc(Integer medecinId);
    
    org.springframework.data.domain.Page<Prescription> findByRendezvousMedecinIdOrderByCreatedAtDesc(Integer medecinId, org.springframework.data.domain.Pageable pageable);
    
    List<Prescription> findByRendezvousPatientIdOrderByCreatedAtDesc(Integer patientId);
}