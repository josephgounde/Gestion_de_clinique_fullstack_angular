package com.groupe.gestion_clinic.services;

import com.groupe.gestion_clinic.dto.MedecinDto;
import com.groupe.gestion_clinic.dto.RendezvousDto;
import com.groupe.gestion_clinic.dto.requestDto.RendezvousRequestDto;
import com.groupe.gestion_clinic.exceptions.ConflictException;
import com.groupe.gestion_clinic.exceptions.TooLateToCancelException;
import com.groupe.gestion_clinic.model.*;
import com.groupe.gestion_clinic.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service("rendezvousServiceNew")
@RequiredArgsConstructor
public class RendezvousServiceNew {

    private final RendezvousRepository rendezvousRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final com.groupe.gestion_clinic.notificationConfig.NotificationService notificationService;

    public RendezvousDto createRendezVous(Object requestDto) {
        // Gérer les données du frontend (Map ou DTO)
        Integer medecinId, patientId;
        LocalDateTime dateHeure;
        String motif, salle;
        
        if (requestDto instanceof java.util.Map) {
            java.util.Map<String, Object> map = (java.util.Map<String, Object>) requestDto;
            // Gestion sécurisée des types
            Object medecinIdObj = map.get("medecinId");
            Object patientIdObj = map.get("patientId");
            
            medecinId = medecinIdObj instanceof String ? Integer.parseInt((String) medecinIdObj) : (Integer) medecinIdObj;
            patientId = patientIdObj instanceof String ? Integer.parseInt((String) patientIdObj) : (Integer) patientIdObj;
            dateHeure = LocalDateTime.parse((String) map.get("dateHeureDebut"));
            motif = (String) map.get("motif");
            salle = (String) map.get("salle");
        } else {
            RendezvousRequestDto request = (RendezvousRequestDto) requestDto;
            medecinId = request.getMedecinId();
            patientId = request.getPatientId();
            dateHeure = request.getDateHeureDebut();
            motif = request.getMotif();
            salle = request.getSalle();
        }
        
        // Validation des conflits
        try {
            validateRendezVousConflicts(medecinId, patientId, dateHeure, null);
        } catch (ConflictException e) {
            // Notifier le médecin concerné
            if (medecinId != null) {
                com.groupe.gestion_clinic.dto.NotificationDto conflictNotif = new com.groupe.gestion_clinic.dto.NotificationDto(
                    "CONFLICT_DETECTED",
                    "⚠️ Conflit de rendez-vous: " + e.getMessage(),
                    null,
                    LocalDateTime.now(),
                    "MEDECIN",
                    medecinId.longValue()
                );
                notificationService.sendPrivateNotification(medecinId.longValue(), conflictNotif);
            }
            
            // Notifier toutes les secrétaires
            com.groupe.gestion_clinic.dto.NotificationDto globalNotif = new com.groupe.gestion_clinic.dto.NotificationDto(
                "CONFLICT_DETECTED",
                "⚠️ Tentative de création échouée: " + e.getMessage(),
                null,
                LocalDateTime.now(),
                "SECRETAIRE",
                null
            );
            notificationService.sendPublicNotification(globalNotif);
            
            throw e;
        }
        
        Rendezvous rendezvous = new Rendezvous();
        rendezvous.setStatut(StatutRendezVous.PLANIFIE);
        rendezvous.setDateHeureDebut(dateHeure);
        rendezvous.setMotif(motif);
        rendezvous.setSalle(salle);
        
        // Associer patient et médecin
        if (patientId != null) {
            Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
            rendezvous.setPatient(patient);
        }
        
        if (medecinId != null) {
            Medecin medecin = medecinRepository.findById(medecinId)
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé"));
            rendezvous.setMedecin(medecin);
        }
        
        Rendezvous saved = rendezvousRepository.save(rendezvous);
        
        // Send notification
        if (saved.getMedecin() != null) {
            com.groupe.gestion_clinic.dto.NotificationDto notif = new com.groupe.gestion_clinic.dto.NotificationDto(
                "NEW_RDV",
                "Nouveau rendez-vous planifié pour " + saved.getDateHeureDebut().toLocalDate(),
                saved.getId(),
                LocalDateTime.now(),
                "MEDECIN",
                saved.getMedecin().getId().longValue()
            );
            notificationService.sendPrivateNotification(saved.getMedecin().getId().longValue(), notif);
        }
        
        return convertToDto(saved);
    }

    public RendezvousDto updateRendezVous(Integer id, Object requestDto) {
        // Gérer les données du frontend
        Integer medecinId, patientId;
        LocalDateTime dateHeure;
        String motif, salle;
        
        if (requestDto instanceof java.util.Map) {
            java.util.Map<String, Object> map = (java.util.Map<String, Object>) requestDto;
            // Gestion sécurisée des types
            Object medecinIdObj = map.get("medecinId");
            Object patientIdObj = map.get("patientId");
            
            medecinId = medecinIdObj instanceof String ? Integer.parseInt((String) medecinIdObj) : (Integer) medecinIdObj;
            patientId = patientIdObj instanceof String ? Integer.parseInt((String) patientIdObj) : (Integer) patientIdObj;
            dateHeure = LocalDateTime.parse((String) map.get("dateHeureDebut"));
            motif = (String) map.get("motif");
            salle = (String) map.get("salle");
        } else {
            RendezvousRequestDto request = (RendezvousRequestDto) requestDto;
            medecinId = request.getMedecinId();
            patientId = request.getPatientId();
            dateHeure = request.getDateHeureDebut();
            motif = request.getMotif();
            salle = request.getSalle();
        }
        
        Rendezvous rendezvous = rendezvousRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));
        
        // Validation des conflits (exclure le RDV actuel)
        validateRendezVousConflicts(medecinId, patientId, dateHeure, id);
        
        rendezvous.setDateHeureDebut(dateHeure);
        rendezvous.setMotif(motif);
        rendezvous.setSalle(salle);
        
        Rendezvous updated = rendezvousRepository.save(rendezvous);
        return convertToDto(updated);
    }

    public RendezvousDto updateRendezVousStatus(Integer id, StatutRendezVous statut) {
        Rendezvous rendezvous = rendezvousRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));
        
        rendezvous.setStatut(statut);
        if (statut == StatutRendezVous.ANNULE) {
            rendezvous.setDateAnnulation(LocalDateTime.now());
        }
        
        Rendezvous updated = rendezvousRepository.save(rendezvous);
        
        // Send notifications based on status
        String objMessage = "";
        String message = "";
        
        switch (statut) {
            case CONFIRME:
                objMessage = "RDV_CONFIRMED";
                message = "Rendez-vous confirmé pour " + updated.getDateHeureDebut().toLocalDate();
                break;
            case TERMINE:
                objMessage = "RDV_COMPLETED";
                message = "Rendez-vous terminé avec succès";
                break;
            case ANNULE:
                objMessage = "RDV_CANCELLED";
                message = "Rendez-vous annulé pour " + updated.getDateHeureDebut().toLocalDate();
                break;
        }
        
        if (!objMessage.isEmpty() && updated.getMedecin() != null) {
            com.groupe.gestion_clinic.dto.NotificationDto notif = new com.groupe.gestion_clinic.dto.NotificationDto(
                objMessage,
                message,
                updated.getId(),
                LocalDateTime.now(),
                "MEDECIN",
                updated.getMedecin().getId().longValue()
            );
            notificationService.sendPrivateNotification(updated.getMedecin().getId().longValue(), notif);
        }
        
        return convertToDto(updated);
    }

    public List<RendezvousDto> getAllRendezVous() {
        return rendezvousRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public org.springframework.data.domain.Page<RendezvousDto> getAllRendezVousPaginated(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return rendezvousRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::convertToDto);
    }

    public RendezvousDto getRendezVousById(Integer id) {
        Rendezvous rendezvous = rendezvousRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));
        return convertToDto(rendezvous);
    }

    public Void cancelRendezVous(Integer id) {
        Rendezvous rendezvous = rendezvousRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));
        
        // Vérifier délai d'annulation (24h)
        if (rendezvous.getDateHeureDebut() != null && rendezvous.getDateHeureDebut().isBefore(LocalDateTime.now().plusHours(24))) {
            throw new TooLateToCancelException("Impossible d'annuler un rendez-vous moins de 24h avant");
        }
        
        rendezvous.setStatut(StatutRendezVous.ANNULE);
        rendezvous.setDateAnnulation(LocalDateTime.now());
        rendezvousRepository.save(rendezvous);
        return null;
    }

    public void deleteRendezVous(Integer id) {
        rendezvousRepository.deleteById(id);
    }

    public List<RendezvousDto> getUpcomingRendezVousForMedecin() {
        return rendezvousRepository.findAll().stream()
                .filter(rdv -> rdv.getDateHeureDebut() != null && rdv.getDateHeureDebut().isAfter(LocalDateTime.now()))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<RendezvousDto> getRendezVousBetweenDates(LocalDateTime start, LocalDateTime end, Integer medecinId) {
        return rendezvousRepository.findAll().stream()
                .filter(rdv -> rdv.getDateHeureDebut() != null && rdv.getDateHeureDebut().isAfter(start) && rdv.getDateHeureDebut().isBefore(end))
                .filter(rdv -> medecinId == null || (rdv.getMedecin() != null && rdv.getMedecin().getId().equals(medecinId)))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<RendezvousDto> searchRendezVous(Object searchDto) {
        return getAllRendezVous();
    }

    private RendezvousDto convertToDto(Rendezvous rendezvous) {
        RendezvousDto dto = new RendezvousDto();
        dto.setId(rendezvous.getId());
        dto.setDateHeureDebut(rendezvous.getDateHeureDebut());
        dto.setMotif(rendezvous.getMotif());
        dto.setSalle(rendezvous.getSalle());
        dto.setStatut(rendezvous.getStatut());
        
        if (rendezvous.getPatient() != null) {
            dto.setPatientId(rendezvous.getPatient().getId());
            dto.setPatientNom(rendezvous.getPatient().getPrenom() + " " + rendezvous.getPatient().getNom());
        }
        
        if (rendezvous.getMedecin() != null) {
            dto.setMedecinDTO(MedecinDto.fromEntity(rendezvous.getMedecin()));
        }
        
        return dto;
    }
    
    private void validateRendezVousConflicts(Integer medecinId, Integer patientId, 
                                           LocalDateTime dateHeure, Integer excludeId) {
        // Vérifier conflit médecin (même heure)
        if (medecinId != null) {
            List<Rendezvous> medecinRdv = rendezvousRepository.findAll().stream()
                .filter(rdv -> rdv.getMedecin() != null && rdv.getMedecin().getId().equals(medecinId))
                .filter(rdv -> rdv.getStatut() != StatutRendezVous.ANNULE)
                .filter(rdv -> excludeId == null || !rdv.getId().equals(excludeId))
                .filter(rdv -> rdv.getDateHeureDebut() != null && rdv.getDateHeureDebut().equals(dateHeure))
                .collect(Collectors.toList());
                
            if (!medecinRdv.isEmpty()) {
                throw new ConflictException("Le médecin a déjà un rendez-vous à cette heure");
            }
        }
        
        // Vérifier conflit patient (même heure exacte au lieu du même jour)
        if (patientId != null) {
            List<Rendezvous> patientRdv = rendezvousRepository.findAll().stream()
                .filter(rdv -> rdv.getPatient() != null && rdv.getPatient().getId().equals(patientId))
                .filter(rdv -> rdv.getStatut() != StatutRendezVous.ANNULE)
                .filter(rdv -> excludeId == null || !rdv.getId().equals(excludeId))
                .filter(rdv -> rdv.getDateHeureDebut() != null && rdv.getDateHeureDebut().equals(dateHeure))
                .collect(Collectors.toList());
                
            if (!patientRdv.isEmpty()) {
                throw new ConflictException("Le patient a déjà un rendez-vous à cette heure exacte");
            }
        }
    }
}