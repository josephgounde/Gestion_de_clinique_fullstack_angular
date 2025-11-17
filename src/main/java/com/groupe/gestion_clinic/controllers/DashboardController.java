package com.groupe.gestion_clinic.controllers;

import com.groupe.gestion_clinic.repositories.PatientRepository;
import com.groupe.gestion_clinic.repositories.MedecinRepository;
import com.groupe.gestion_clinic.repositories.RendezvousRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class DashboardController {

    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final RendezvousRepository rendezVousRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Statistiques de base
            long totalPatients = patientRepository.count();
            long totalMedecins = medecinRepository.count();
            long totalRendezVous = rendezVousRepository.count();
            
            System.out.println("Stats calculées: Patients=" + totalPatients + ", Medecins=" + totalMedecins + ", RDV=" + totalRendezVous);
            
            stats.put("totalPatients", totalPatients);
            stats.put("totalMedecins", totalMedecins);
            stats.put("totalRendezVous", totalRendezVous);
            
            // Rendez-vous d'aujourd'hui
            java.time.LocalDate today = java.time.LocalDate.now();
            long rdvAujourdhui = rendezVousRepository.findAll().stream()
                .filter(rdv -> rdv.getDateHeureDebut() != null && 
                              rdv.getDateHeureDebut().toLocalDate().equals(today))
                .count();
            stats.put("rendezVousAujourdhui", rdvAujourdhui);
            
            // Rendez-vous en attente (statut PLANIFIE)
            long rdvEnAttente = rendezVousRepository.findAll().stream()
                .filter(rdv -> rdv.getStatut() != null && 
                              rdv.getStatut().name().equals("PLANIFIE"))
                .count();
            stats.put("rendezVousEnAttente", rdvEnAttente);
            
        } catch (Exception e) {
            System.err.println("Erreur lors du calcul des stats: " + e.getMessage());
            e.printStackTrace();
            // Valeurs par défaut en cas d'erreur
            stats.put("totalPatients", 0L);
            stats.put("totalMedecins", 0L);
            stats.put("totalRendezVous", 0L);
            stats.put("rendezVousAujourdhui", 0L);
            stats.put("rendezVousEnAttente", 0L);
        }
        
        System.out.println("Stats finales envoyées: " + stats);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/medecin/{medecinId}/stats")
    public ResponseEntity<Map<String, Object>> getMedecinStats(@PathVariable Integer medecinId) {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Patients uniques du médecin
            long mesPatients = rendezVousRepository.findAll().stream()
                .filter(rdv -> rdv.getMedecin() != null && rdv.getMedecin().getId().equals(medecinId))
                .map(rdv -> rdv.getPatient())
                .filter(patient -> patient != null)
                .map(patient -> patient.getId())
                .distinct()
                .count();
            
            // RDV aujourd'hui pour ce médecin
            LocalDate today = LocalDate.now();
            long rdvAujourdhui = rendezVousRepository.findAll().stream()
                .filter(rdv -> rdv.getMedecin() != null && rdv.getMedecin().getId().equals(medecinId))
                .filter(rdv -> rdv.getDateHeureDebut() != null && 
                              rdv.getDateHeureDebut().toLocalDate().equals(today))
                .count();
            
            // RDV en attente pour ce médecin
            long rdvEnAttente = rendezVousRepository.findAll().stream()
                .filter(rdv -> rdv.getMedecin() != null && rdv.getMedecin().getId().equals(medecinId))
                .filter(rdv -> rdv.getStatut() != null && 
                              rdv.getStatut().name().equals("PLANIFIE"))
                .count();
            
            stats.put("mesPatients", mesPatients);
            stats.put("rdvAujourdhui", rdvAujourdhui);
            stats.put("rdvEnAttente", rdvEnAttente);
            
        } catch (Exception e) {
            stats.put("mesPatients", 0L);
            stats.put("rdvAujourdhui", 0L);
            stats.put("rdvEnAttente", 0L);
        }
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent-rendezvous")
    public ResponseEntity<?> getRecentRendezVous() {
        try {
            // Récupérer les 5 derniers rendez-vous
            java.util.List<java.util.Map<String, Object>> recentRdv = rendezVousRepository.findAll().stream()
                .filter(rdv -> rdv.getDateHeureDebut() != null)
                .sorted((a, b) -> b.getDateHeureDebut().compareTo(a.getDateHeureDebut()))
                .limit(5)
                .map(rdv -> {
                    Map<String, Object> rdvMap = new HashMap<>();
                    rdvMap.put("id", rdv.getId());
                    rdvMap.put("dateHeure", rdv.getDateHeureDebut().toString());
                    rdvMap.put("motif", rdv.getMotif());
                    rdvMap.put("statut", rdv.getStatut() != null ? rdv.getStatut().name() : "PLANIFIE");
                    
                    if (rdv.getPatient() != null) {
                        Map<String, Object> patient = new HashMap<>();
                        patient.put("nom", rdv.getPatient().getNom());
                        patient.put("prenom", rdv.getPatient().getPrenom());
                        rdvMap.put("patient", patient);
                    }
                    
                    if (rdv.getMedecin() != null) {
                        Map<String, Object> medecin = new HashMap<>();
                        medecin.put("nom", rdv.getMedecin().getNom());
                        medecin.put("prenom", rdv.getMedecin().getPrenom());
                        rdvMap.put("medecin", medecin);
                    }
                    
                    return rdvMap;
                })
                .collect(java.util.stream.Collectors.toList());
                
            return ResponseEntity.ok(recentRdv);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
}