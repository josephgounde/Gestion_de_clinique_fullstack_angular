package com.groupe.gestion_clinic.services;

import com.groupe.gestion_clinic.model.AuditLog;
import com.groupe.gestion_clinic.repositories.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void logAction(String action, String userEmail, String userRole, String details, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .utilisateurEmail(userEmail)
                .utilisateurRole(userRole)
                .details(details)
                .adresseIP(ipAddress)
                .build();
        
        auditLogRepository.save(log);
    }

    public void logLogin(String userEmail, String userRole, String ipAddress) {
        logAction("LOGIN", userEmail, userRole, "Connexion utilisateur", ipAddress);
    }

    public void logLogout(String userEmail, String userRole, String ipAddress) {
        logAction("LOGOUT", userEmail, userRole, "Déconnexion utilisateur", ipAddress);
    }

    public void logCreateRendezVous(String userEmail, String userRole, Integer rdvId, String ipAddress) {
        logAction("CREATE_RDV", userEmail, userRole, "Création rendez-vous ID: " + rdvId, ipAddress);
    }

    public void logUpdateRendezVousStatus(String userEmail, String userRole, Integer rdvId, String newStatus, String ipAddress) {
        logAction("UPDATE_RDV_STATUS", userEmail, userRole, "Changement statut RDV ID: " + rdvId + " -> " + newStatus, ipAddress);
    }

    public void logCreatePatient(String userEmail, String userRole, Integer patientId, String ipAddress) {
        logAction("CREATE_PATIENT", userEmail, userRole, "Création patient ID: " + patientId, ipAddress);
    }
}