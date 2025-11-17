package com.groupe.gestion_clinic.controllers;

import com.groupe.gestion_clinic.repositories.PatientRepository;
import com.groupe.gestion_clinic.repositories.MedecinRepository;
import com.groupe.gestion_clinic.repositories.RendezvousRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final RendezvousRepository rendezVousRepository;

    @GetMapping("/global")
    public ResponseEntity<List<Map<String, Object>>> globalSearch(@RequestParam String q) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        try {
            // Recherche dans les patients
            patientRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(q, q)
                .forEach(patient -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", patient.getId());
                    result.put("type", "patient");
                    result.put("title", patient.getPrenom() + " " + patient.getNom());
                    result.put("subtitle", patient.getEmail());
                    result.put("description", "Patient - Tél: " + (patient.getTelephone() != null ? patient.getTelephone() : "N/A"));
                    results.add(result);
                });
            
            // Recherche dans les médecins
            medecinRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(q, q)
                .forEach(medecin -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", medecin.getId());
                    result.put("type", "medecin");
                    result.put("title", "Dr. " + medecin.getPrenom() + " " + medecin.getNom());
                    result.put("subtitle", medecin.getSpecialite() != null ? medecin.getSpecialite() : "Médecin généraliste");
                    result.put("description", "Médecin - " + medecin.getEmail());
                    results.add(result);
                });
            
            // Recherche dans les rendez-vous par motif
            rendezVousRepository.findAll().stream()
                .filter(rdv -> rdv.getMotif() != null && 
                              rdv.getMotif().toLowerCase().contains(q.toLowerCase()))
                .limit(10) // Limiter à 10 résultats pour les performances
                .forEach(rdv -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", rdv.getId());
                    result.put("type", "rendezvous");
                    result.put("title", "RDV: " + rdv.getMotif());
                    
                    String subtitle = "";
                    if (rdv.getPatient() != null) {
                        subtitle += rdv.getPatient().getPrenom() + " " + rdv.getPatient().getNom();
                    }
                    if (rdv.getMedecin() != null) {
                        subtitle += " - Dr. " + rdv.getMedecin().getPrenom() + " " + rdv.getMedecin().getNom();
                    }
                    result.put("subtitle", subtitle);
                    
                    String description = "Rendez-vous";
                    if (rdv.getDateHeureDebut() != null) {
                        description += " - " + rdv.getDateHeureDebut().toLocalDate();
                    }
                    if (rdv.getStatut() != null) {
                        description += " (" + rdv.getStatut().name() + ")";
                    }
                    result.put("description", description);
                    
                    results.add(result);
                });
            
            // Recherche étendue dans les patients par email
            if (q.contains("@")) {
                patientRepository.findAll().stream()
                    .filter(patient -> patient.getEmail() != null && 
                                      patient.getEmail().toLowerCase().contains(q.toLowerCase()))
                    .filter(patient -> results.stream().noneMatch(r -> 
                        "patient".equals(r.get("type")) && patient.getId().equals(r.get("id"))))
                    .forEach(patient -> {
                        Map<String, Object> result = new HashMap<>();
                        result.put("id", patient.getId());
                        result.put("type", "patient");
                        result.put("title", patient.getPrenom() + " " + patient.getNom());
                        result.put("subtitle", patient.getEmail());
                        result.put("description", "Patient trouvé par email");
                        results.add(result);
                    });
            }
            
        } catch (Exception e) {
            // En cas d'erreur, retourner une liste vide
            System.err.println("Erreur lors de la recherche globale: " + e.getMessage());
        }
        
        return ResponseEntity.ok(results);
    }
}