package com.groupe.gestion_clinic.services.serviceImpl;

import com.groupe.gestion_clinic.dto.PatientDto;
import com.groupe.gestion_clinic.dto.PatientHistoryDto;
import com.groupe.gestion_clinic.dto.PrescriptionDto;
import com.groupe.gestion_clinic.dto.RendezvousDto;
import com.groupe.gestion_clinic.model.Patient;
import com.groupe.gestion_clinic.repositories.PatientRepository;
import com.groupe.gestion_clinic.repositories.RendezvousRepository;
import com.groupe.gestion_clinic.repositories.PrescriptionRepository;
import com.groupe.gestion_clinic.services.PatientService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import com.groupe.gestion_clinic.exceptions.NotFoundException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final RendezvousRepository rendezvousRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Override
    public PatientDto createPatient(PatientDto patientDto) {

        if(patientRepository.findByEmail(patientDto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Patient with email already exists");
        }
        return PatientDto.fromEntity(patientRepository.save(PatientDto.toEntity(patientDto)));
    }

    @Override
    public PatientDto updatePatient(Integer id, PatientDto patientDto) {

        PatientDto dto =
                patientRepository
                        .findById(id)
                        .map(PatientDto::fromEntity)
                        .orElseThrow(
                                ()-> new EntityNotFoundException("Patient with id " + id + " not found")
                        );

        dto.setAllergies(patientDto.getAllergies());
        dto.setEmail(patientDto.getEmail());
        dto.setTelephone(patientDto.getTelephone());
        dto.setNom(patientDto.getNom());
        dto.setPrenom(patientDto.getPrenom());

        return PatientDto.fromEntity(patientRepository.save(PatientDto.toEntity(patientDto)));
    }

    @Override
    public PatientDto findById(Integer id) {
        return
                patientRepository
                        .findById(id)
                        .map(PatientDto::fromEntity)
                        .orElseThrow(()->new EntityNotFoundException("Patient with id " + id + " not found"));
    }

    @Override
    public List<PatientDto> findAll() {
        return patientRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(PatientDto::fromEntity)
                .toList();
    }

    public org.springframework.data.domain.Page<PatientDto> findAllPaginated(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, 
            org.springframework.data.domain.Sort.by("createdAt").descending());
        return patientRepository.findAll(pageable).map(PatientDto::fromEntity);
    }


    @Override
    public PatientDto deletePatient(Integer id) {
        if(id == null) {
            return null;
        }

        Patient patient =
                        patientRepository
                                .findById(id)
                                .orElseThrow(
                                    ()->new EntityNotFoundException("Patient with id " + id + " not found")
                                );
        patientRepository.deleteById(id);
        return PatientDto.fromEntity(patient);
    }

    @Override
    public List<PrescriptionDto> getPatientPrescriptionsHistory(Integer patientId) {
        return List.of();
    }

    @Override
    public PatientHistoryDto getPatientHistory(Integer patientId) {
        try {
            PatientDto patient = findById(patientId);
            
            List<RendezvousDto> rendezvous = rendezvousRepository.findByPatientIdOrderByDateHeureDebutDesc(patientId)
                    .stream()
                    .map(RendezvousDto::fromEntity)
                    .toList();
                    
            List<PrescriptionDto> prescriptions = prescriptionRepository.findByRendezvousPatientIdOrderByCreatedAtDesc(patientId)
                    .stream()
                    .map(PrescriptionDto::fromEntity)
                    .toList();
            
            String lastConsultationDate = rendezvous.isEmpty() ? "Aucune consultation" : 
                    (rendezvous.get(0).getDateHeureDebut() != null ? 
                        rendezvous.get(0).getDateHeureDebut().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : 
                        "Date non disponible");
            
            return PatientHistoryDto.builder()
                    .patient(patient)
                    .rendezvous(rendezvous)
                    .prescriptions(prescriptions)
                    .totalConsultations(rendezvous.size())
                    .lastConsultationDate(lastConsultationDate)
                    .build();
        } catch (Exception e) {
            throw new NotFoundException("Erreur lors de la récupération de l'historique du patient: " + e.getMessage());
        }
    }

    @Override
    public byte[] generatePatientHistoryPdf(Integer patientId) {
        try {
            PatientHistoryDto history = getPatientHistory(patientId);
            PatientDto patient = history.getPatient();
            
            try (PDDocument document = new PDDocument()) {
                PDPage page = new PDPage(PDRectangle.A4);
                document.addPage(page);
                
                try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                    PDType1Font fontBold = PDType1Font.HELVETICA_BOLD;
                    PDType1Font font = PDType1Font.HELVETICA;
                    
                    float pageWidth = page.getMediaBox().getWidth();
                    float pageHeight = page.getMediaBox().getHeight();
                    float margin = 50;
                    float yPosition = pageHeight - margin;
                    
                    // En-tete avec ligne bleue
                    contentStream.setStrokingColor(0.2f, 0.4f, 0.8f);
                    contentStream.setLineWidth(4);
                    contentStream.moveTo(margin, yPosition - 10);
                    contentStream.lineTo(pageWidth - margin, yPosition - 10);
                    contentStream.stroke();
                    
                    // Titre centre
                    contentStream.beginText();
                    contentStream.setFont(fontBold, 24);
                    contentStream.setNonStrokingColor(0.2f, 0.4f, 0.8f);
                    String title = "HISTORIQUE MEDICAL";
                    float titleWidth = fontBold.getStringWidth(title) / 1000 * 24;
                    contentStream.newLineAtOffset((pageWidth - titleWidth) / 2, yPosition - 45);
                    contentStream.showText(title);
                    contentStream.endText();
                    yPosition -= 80;
                    
                    // Date generation
                    contentStream.beginText();
                    contentStream.setFont(font, 10);
                    contentStream.setNonStrokingColor(0.5f, 0.5f, 0.5f);
                    String dateStr = "Genere le " + java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy a HH:mm"));
                    float dateWidth = font.getStringWidth(dateStr) / 1000 * 10;
                    contentStream.newLineAtOffset(pageWidth - margin - dateWidth, yPosition);
                    contentStream.showText(dateStr);
                    contentStream.endText();
                    yPosition -= 40;
                    
                    // Boite informations patient
                    contentStream.setNonStrokingColor(0.95f, 0.97f, 1.0f);
                    contentStream.addRect(margin, yPosition - 120, pageWidth - 2 * margin, 120);
                    contentStream.fill();
                    
                    contentStream.setStrokingColor(0.2f, 0.4f, 0.8f);
                    contentStream.setLineWidth(2);
                    contentStream.addRect(margin, yPosition - 120, pageWidth - 2 * margin, 120);
                    contentStream.stroke();
                    
                    // Titre section patient
                    contentStream.beginText();
                    contentStream.setFont(fontBold, 16);
                    contentStream.setNonStrokingColor(0.2f, 0.4f, 0.8f);
                    contentStream.newLineAtOffset(margin + 15, yPosition - 25);
                    contentStream.showText("INFORMATIONS PATIENT");
                    contentStream.endText();
                    
                    // Informations patient
                    contentStream.setNonStrokingColor(0, 0, 0);
                    yPosition -= 50;
                    
                    contentStream.beginText();
                    contentStream.setFont(fontBold, 12);
                    contentStream.newLineAtOffset(margin + 15, yPosition);
                    contentStream.showText("Nom complet: ");
                    contentStream.setFont(font, 12);
                    contentStream.showText((patient.getNom() != null ? patient.getNom() : "") + " " + (patient.getPrenom() != null ? patient.getPrenom() : ""));
                    contentStream.endText();
                    yPosition -= 18;
                    
                    contentStream.beginText();
                    contentStream.setFont(fontBold, 12);
                    contentStream.newLineAtOffset(margin + 15, yPosition);
                    contentStream.showText("Email: ");
                    contentStream.setFont(font, 12);
                    contentStream.showText(patient.getEmail() != null ? patient.getEmail() : "Non renseigne");
                    contentStream.endText();
                    yPosition -= 18;
                    
                    contentStream.beginText();
                    contentStream.setFont(fontBold, 12);
                    contentStream.newLineAtOffset(margin + 15, yPosition);
                    contentStream.showText("Telephone: ");
                    contentStream.setFont(font, 12);
                    contentStream.showText(patient.getTelephone() != null ? patient.getTelephone() : "Non renseigne");
                    contentStream.endText();
                    yPosition -= 40;
                    
                    // Section antecedents
                    if (patient.getAntecedents() != null && !patient.getAntecedents().trim().isEmpty()) {
                        // Boite antecedents
                        contentStream.setNonStrokingColor(0.98f, 0.98f, 0.98f);
                        contentStream.addRect(margin, yPosition - 60, pageWidth - 2 * margin, 60);
                        contentStream.fill();
                        
                        contentStream.setStrokingColor(0.7f, 0.7f, 0.7f);
                        contentStream.setLineWidth(1);
                        contentStream.addRect(margin, yPosition - 60, pageWidth - 2 * margin, 60);
                        contentStream.stroke();
                        
                        contentStream.beginText();
                        contentStream.setFont(fontBold, 14);
                        contentStream.setNonStrokingColor(0.3f, 0.3f, 0.3f);
                        contentStream.newLineAtOffset(margin + 15, yPosition - 20);
                        contentStream.showText("ANTECEDENTS MEDICAUX");
                        contentStream.endText();
                        
                        contentStream.beginText();
                        contentStream.setFont(font, 11);
                        contentStream.setNonStrokingColor(0, 0, 0);
                        contentStream.newLineAtOffset(margin + 15, yPosition - 40);
                        contentStream.showText(patient.getAntecedents());
                        contentStream.endText();
                        yPosition -= 80;
                    }
                    
                    // Section allergies
                    if (patient.getAllergies() != null && !patient.getAllergies().trim().isEmpty()) {
                        // Boite allergies (rouge clair)
                        contentStream.setNonStrokingColor(1.0f, 0.95f, 0.95f);
                        contentStream.addRect(margin, yPosition - 60, pageWidth - 2 * margin, 60);
                        contentStream.fill();
                        
                        contentStream.setStrokingColor(0.8f, 0.2f, 0.2f);
                        contentStream.setLineWidth(2);
                        contentStream.addRect(margin, yPosition - 60, pageWidth - 2 * margin, 60);
                        contentStream.stroke();
                        
                        contentStream.beginText();
                        contentStream.setFont(fontBold, 14);
                        contentStream.setNonStrokingColor(0.8f, 0.2f, 0.2f);
                        contentStream.newLineAtOffset(margin + 15, yPosition - 20);
                        contentStream.showText("ALLERGIES CONNUES");
                        contentStream.endText();
                        
                        contentStream.beginText();
                        contentStream.setFont(font, 11);
                        contentStream.setNonStrokingColor(0, 0, 0);
                        contentStream.newLineAtOffset(margin + 15, yPosition - 40);
                        contentStream.showText(patient.getAllergies());
                        contentStream.endText();
                        yPosition -= 80;
                    }
                    
                    // Section statistiques
                    contentStream.setNonStrokingColor(0.95f, 1.0f, 0.95f);
                    contentStream.addRect(margin, yPosition - 100, pageWidth - 2 * margin, 100);
                    contentStream.fill();
                    
                    contentStream.setStrokingColor(0.2f, 0.7f, 0.2f);
                    contentStream.setLineWidth(2);
                    contentStream.addRect(margin, yPosition - 100, pageWidth - 2 * margin, 100);
                    contentStream.stroke();
                    
                    contentStream.beginText();
                    contentStream.setFont(fontBold, 16);
                    contentStream.setNonStrokingColor(0.2f, 0.7f, 0.2f);
                    contentStream.newLineAtOffset(margin + 15, yPosition - 25);
                    contentStream.showText("RESUME DES CONSULTATIONS");
                    contentStream.endText();
                    
                    contentStream.setNonStrokingColor(0, 0, 0);
                    yPosition -= 50;
                    
                    contentStream.beginText();
                    contentStream.setFont(fontBold, 12);
                    contentStream.newLineAtOffset(margin + 15, yPosition);
                    contentStream.showText("Nombre total de consultations: ");
                    contentStream.setFont(font, 12);
                    contentStream.showText(String.valueOf(history.getTotalConsultations()));
                    contentStream.endText();
                    yPosition -= 18;
                    
                    contentStream.beginText();
                    contentStream.setFont(fontBold, 12);
                    contentStream.newLineAtOffset(margin + 15, yPosition);
                    contentStream.showText("Nombre de prescriptions: ");
                    contentStream.setFont(font, 12);
                    contentStream.showText(String.valueOf(history.getPrescriptions().size()));
                    contentStream.endText();
                    yPosition -= 18;
                    
                    contentStream.beginText();
                    contentStream.setFont(fontBold, 12);
                    contentStream.newLineAtOffset(margin + 15, yPosition);
                    contentStream.showText("Derniere consultation: ");
                    contentStream.setFont(font, 12);
                    contentStream.showText(history.getLastConsultationDate());
                    contentStream.endText();
                    
                    // Pied de page
                    contentStream.setStrokingColor(0.8f, 0.8f, 0.8f);
                    contentStream.setLineWidth(1);
                    contentStream.moveTo(margin, 60);
                    contentStream.lineTo(pageWidth - margin, 60);
                    contentStream.stroke();
                    
                    contentStream.beginText();
                    contentStream.setFont(font, 9);
                    contentStream.setNonStrokingColor(0.5f, 0.5f, 0.5f);
                    String footer = "Gestion Clinique - Historique Patient - Confidentiel";
                    float footerWidth = font.getStringWidth(footer) / 1000 * 9;
                    contentStream.newLineAtOffset((pageWidth - footerWidth) / 2, 40);
                    contentStream.showText(footer);
                    contentStream.endText();
                }
                
                ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                document.save(byteArrayOutputStream);
                return byteArrayOutputStream.toByteArray();
            }
        } catch (Exception e) {
            throw new RuntimeException("Erreur generation PDF: " + e.getMessage(), e);
        }
    }
}
