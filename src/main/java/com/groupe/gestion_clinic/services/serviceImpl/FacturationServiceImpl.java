package com.groupe.gestion_clinic.services.serviceImpl;

import com.groupe.gestion_clinic.dto.FactureDto;
import com.groupe.gestion_clinic.model.Facture;
import com.groupe.gestion_clinic.model.Prescription;
import com.groupe.gestion_clinic.model.StatutFacture;
import com.groupe.gestion_clinic.repositories.FactureRepository;
import com.groupe.gestion_clinic.repositories.PrescriptionRepository;
import com.groupe.gestion_clinic.services.FacturationService;
import com.groupe.gestion_clinic.model.StatutFacturation;
import com.groupe.gestion_clinic.repositories.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FacturationServiceImpl implements FacturationService {
    
    private final FactureRepository factureRepository;
    private final PrescriptionRepository prescriptionRepository;
    
    @Override
    public FactureDto creerFacture(Integer prescriptionId, BigDecimal fraisConsultation, 
                                  BigDecimal fraisHospitalisation, BigDecimal fraisExamen) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription non trouvée"));
        
        Double montantTotal = calculerMontantTotal(fraisConsultation, fraisHospitalisation, fraisExamen);
        
        Facture facture = Facture.builder()
                .numeroFacture("FACT-" + System.currentTimeMillis())
                .montantTotal(montantTotal)
                .fraisConsultation(fraisConsultation != null ? fraisConsultation.doubleValue() : 0.0)
                .fraisHospitalisation(fraisHospitalisation != null ? fraisHospitalisation.doubleValue() : 0.0)
                .fraisExamen(fraisExamen != null ? fraisExamen.doubleValue() : 0.0)
                .dateEcheance(LocalDate.now().plusDays(1))
                .statut(StatutFacture.IMPAYEE)
                .prescription(Arrays.asList(prescription))
                .build();
        
        Facture saved = factureRepository.save(facture);
        
        // Marquer la prescription comme facturée (désactivé temporairement)
        // prescription.setStatutFacturation(StatutFacturation.FACTUREE);
        // prescriptionRepository.save(prescription);
        
        // Notification email au patient (optionnel)
        try {
            if (prescription.getRendezvous() != null && 
                prescription.getRendezvous().getPatient() != null && 
                prescription.getRendezvous().getPatient().getEmail() != null) {
                // emailService.sendFactureEmail() - désactivé temporairement
                System.out.println("Email de facture à envoyer à: " + prescription.getRendezvous().getPatient().getEmail());
            }
        } catch (Exception e) {
            System.err.println("Erreur envoi email facture: " + e.getMessage());
        }
        
        return FactureDto.fromEntity(saved);
    }
    
    @Override
    public List<FactureDto> getAllFactures() {
        return factureRepository.findAll().stream()
                .map(FactureDto::fromEntity)
                .toList();
    }
    
    @Override
    public BigDecimal getRevenuAnnuel(int annee) {
        return factureRepository.findAll().stream()
                .filter(f -> f.getCreatedAt() != null && f.getCreatedAt().getYear() == annee)
                .filter(f -> f.getStatut() == StatutFacture.PAYEE)
                .map(f -> BigDecimal.valueOf(f.getMontantTotal() != null ? f.getMontantTotal() : 0.0))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    @Override
    public BigDecimal getRevenuMensuel(int annee, int mois) {
        return factureRepository.findAll().stream()
                .filter(f -> f.getCreatedAt() != null && 
                           f.getCreatedAt().getYear() == annee && 
                           f.getCreatedAt().getMonthValue() == mois)
                .filter(f -> f.getStatut() == StatutFacture.PAYEE)
                .map(f -> BigDecimal.valueOf(f.getMontantTotal() != null ? f.getMontantTotal() : 0.0))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    @Override
    public byte[] generateFacturePdf(Integer factureId) {
        Facture facture = factureRepository.findById(factureId)
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));
        
        try (org.apache.pdfbox.pdmodel.PDDocument document = new org.apache.pdfbox.pdmodel.PDDocument()) {
            org.apache.pdfbox.pdmodel.PDPage page = new org.apache.pdfbox.pdmodel.PDPage();
            document.addPage(page);
            
            try (org.apache.pdfbox.pdmodel.PDPageContentStream contentStream = 
                 new org.apache.pdfbox.pdmodel.PDPageContentStream(document, page)) {
                
                float yPosition = 750;
                
                // En-tête clinique
                contentStream.beginText();
                contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA_BOLD, 18);
                contentStream.newLineAtOffset(200, yPosition);
                contentStream.showText("CLINIQUE MEDICALE");
                contentStream.endText();
                yPosition -= 30;
                
                // Titre facture
                contentStream.beginText();
                contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA_BOLD, 16);
                contentStream.newLineAtOffset(50, yPosition);
                contentStream.showText("FACTURE N° " + facture.getNumeroFacture());
                contentStream.endText();
                yPosition -= 40;
                
                // Informations détaillées avec gestion des valeurs nulles
                String patientNom = "Patient inconnu";
                String medecinNom = "Médecin inconnu";
                String datePrescription = "Date inconnue";
                
                if (!facture.getPrescription().isEmpty()) {
                    var prescription = facture.getPrescription().get(0);
                    if (prescription.getRendezvous() != null) {
                        var rdv = prescription.getRendezvous();
                        
                        // Récupération patient
                        if (rdv.getPatient() != null) {
                            var patient = rdv.getPatient();
                            patientNom = (patient.getPrenom() != null ? patient.getPrenom() : "") + " " + 
                                        (patient.getNom() != null ? patient.getNom() : "");
                            patientNom = patientNom.trim();
                            if (patientNom.isEmpty()) patientNom = "Patient inconnu";
                        }
                        
                        // Récupération médecin
                        if (rdv.getMedecin() != null) {
                            var medecin = rdv.getMedecin();
                            medecinNom = "Dr. " + (medecin.getPrenom() != null ? medecin.getPrenom() : "") + " " + 
                                        (medecin.getNom() != null ? medecin.getNom() : "");
                            medecinNom = medecinNom.trim();
                            if (medecinNom.equals("Dr.")) medecinNom = "Médecin inconnu";
                        }
                        
                        // Date prescription
                        if (prescription.getCreatedAt() != null) {
                            datePrescription = prescription.getCreatedAt().toLocalDate().toString();
                        }
                    }
                }
                
                // Affichage des informations
                contentStream.beginText();
                contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA, 12);
                contentStream.newLineAtOffset(50, yPosition);
                contentStream.showText("Patient: " + patientNom);
                contentStream.endText();
                yPosition -= 20;
                
                contentStream.beginText();
                contentStream.newLineAtOffset(50, yPosition);
                contentStream.showText("Medecin: " + medecinNom);
                contentStream.endText();
                yPosition -= 30;
                
                contentStream.beginText();
                contentStream.newLineAtOffset(50, yPosition);
                contentStream.showText("Prescription: " + datePrescription);
                contentStream.endText();
                yPosition -= 20;
                
                contentStream.beginText();
                contentStream.newLineAtOffset(50, yPosition);
                contentStream.showText("Facturation: " + facture.getCreatedAt().toLocalDate() + " " + 
                                     facture.getCreatedAt().toLocalTime().toString().substring(0, 8));
                contentStream.endText();
                yPosition -= 30;
                
                yPosition -= 20;
                
                // Détail des frais
                contentStream.beginText();
                contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA_BOLD, 14);
                contentStream.newLineAtOffset(50, yPosition);
                contentStream.showText("DETAIL DES FRAIS");
                contentStream.endText();
                yPosition -= 25;
                
                // Utilisation des vrais montants stockés
                double consultation = facture.getFraisConsultation() != null ? facture.getFraisConsultation() : 0.0;
                double hospitalisation = facture.getFraisHospitalisation() != null ? facture.getFraisHospitalisation() : 0.0;
                double examens = facture.getFraisExamen() != null ? facture.getFraisExamen() : 0.0;
                
                contentStream.beginText();
                contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA, 12);
                contentStream.newLineAtOffset(50, yPosition);
                contentStream.showText("Frais de consultation: " + String.format("%.0f", consultation) + " FCFA");
                contentStream.endText();
                yPosition -= 20;
                
                contentStream.beginText();
                contentStream.newLineAtOffset(50, yPosition);
                contentStream.showText("Frais d'hospitalisation: " + String.format("%.0f", hospitalisation) + " FCFA");
                contentStream.endText();
                yPosition -= 20;
                
                contentStream.beginText();
                contentStream.newLineAtOffset(50, yPosition);
                contentStream.showText("Frais d'examens cliniques: " + String.format("%.0f", examens) + " FCFA");
                contentStream.endText();
                yPosition -= 30;
                
                // Statut
                contentStream.beginText();
                contentStream.newLineAtOffset(50, yPosition);
                contentStream.showText("Statut: " + (facture.getStatut() == StatutFacture.PAYEE ? "PAYEE" : "IMPAYEE"));
                contentStream.endText();
                yPosition -= 40;
                
                // Montant total
                contentStream.beginText();
                contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA_BOLD, 16);
                contentStream.newLineAtOffset(50, yPosition);
                contentStream.showText("MONTANT TOTAL: " + String.format("%.0f", facture.getMontantTotal()) + " FCFA");
                contentStream.endText();
                yPosition -= 60;
                
                // Pied de page
                contentStream.beginText();
                contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA, 10);
                contentStream.newLineAtOffset(50, 50);
                contentStream.showText("Merci de votre confiance - Clinique Medicale");
                contentStream.endText();
            }
            
            java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur génération PDF facture: " + e.getMessage());
        }
    }
    
    @Override
    public FactureDto updateFactureStatus(Integer factureId, StatutFacture statut) {
        try {
            Facture facture = factureRepository.findById(factureId)
                    .orElseThrow(() -> new RuntimeException("Facture non trouvée avec ID: " + factureId));
            
            System.out.println("Facture trouvée: " + facture.getNumeroFacture());
            System.out.println("Ancien statut: " + facture.getStatut());
            System.out.println("Nouveau statut: " + statut);
            
            facture.setStatut(statut);
            Facture savedFacture = factureRepository.save(facture);
            
            System.out.println("Facture mise à jour avec succès");
            return FactureDto.fromEntity(savedFacture);
            
        } catch (Exception e) {
            System.err.println("Erreur lors de la mise à jour du statut: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la mise à jour du statut: " + e.getMessage());
        }
    }
    
    private Double calculerMontantTotal(BigDecimal consultation, BigDecimal hospitalisation, BigDecimal examen) {
        BigDecimal total = BigDecimal.ZERO;
        if (consultation != null) total = total.add(consultation);
        if (hospitalisation != null) total = total.add(hospitalisation);
        if (examen != null) total = total.add(examen);
        return total.doubleValue();
    }
}