package com.groupe.gestion_clinic.services.serviceImpl;

import com.groupe.gestion_clinic.dto.PrescriptionDto;
import com.groupe.gestion_clinic.dto.requestDto.PrescriptionRequestDto;
import com.groupe.gestion_clinic.dto.requestDto.MultiplePrescriptionRequestDto;
import com.groupe.gestion_clinic.exceptions.BusinessException;
import com.groupe.gestion_clinic.exceptions.NotFoundException;
import com.groupe.gestion_clinic.model.Medecin;
import com.groupe.gestion_clinic.model.Patient;
import com.groupe.gestion_clinic.model.Prescription;
import com.groupe.gestion_clinic.model.Rendezvous;
import com.groupe.gestion_clinic.notificationConfig.NotificationService;
import com.groupe.gestion_clinic.repositories.PrescriptionRepository;
import com.groupe.gestion_clinic.repositories.RendezvousRepository;
import com.groupe.gestion_clinic.services.PrescriptionService;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final RendezvousRepository rendezvousRepository;
    private final NotificationService notificationService;

    @Override
    public PrescriptionDto createPrescription(PrescriptionRequestDto requestDto) {
        
        if (requestDto.getRendezvousId() == null) {
            throw new BusinessException("L'ID du rendez-vous est requis");
        }
        
        if (requestDto.getMedicament() == null || requestDto.getMedicament().trim().isEmpty()) {
            throw new BusinessException("Le médicament est requis");
        }

        Rendezvous rendezvous = rendezvousRepository.findById(requestDto.getRendezvousId())
                .orElseThrow(() -> new NotFoundException("Rendezvous non trouvé avec l'ID : " + requestDto.getRendezvousId()));

        Medecin medecin = rendezvous.getMedecin();
        Patient patient = rendezvous.getPatient();

        if (medecin == null || patient == null) {
            throw new BusinessException("Le Rendezvous associé doit avoir un médecin et un patient.");
        }

        Prescription prescription = new Prescription();
        prescription.setPrescriptionDate(requestDto.getPrescriptionDate() != null ? requestDto.getPrescriptionDate() : LocalDate.now());
        prescription.setMedicament(requestDto.getMedicament());
        prescription.setPosologie(requestDto.getPosologie());
        prescription.setDosage(requestDto.getDosage());
        prescription.setEffective(requestDto.getEffective() != null ? requestDto.getEffective() : true);
        prescription.setRendezvous(rendezvous);

        Prescription savedPrescription = prescriptionRepository.save(prescription);
        
        // Notification email au patient
        if (patient.getEmail() != null) {
            notificationService.sendPrescriptionNotification(savedPrescription);
        }
        
        return PrescriptionDto.fromEntity(savedPrescription);
    }

    @Override
    public PrescriptionDto getPrescriptionById(Integer id) {
        return prescriptionRepository
                .findById(id)
                .map(PrescriptionDto::fromEntity)
                .orElseThrow(()-> new NotFoundException("Prescription non trouvée avec l'ID : " + id));
    }

    @Override
    public PrescriptionDto updatePrescription(Integer id, PrescriptionRequestDto requestDto) {
        Prescription existingPrescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Prescription non trouvée avec l'ID : " + id));

        if (requestDto.getRendezvousId() != null && !requestDto.getRendezvousId().equals(existingPrescription.getRendezvous().getId())) {
            Rendezvous newRendezvous = rendezvousRepository.findById(requestDto.getRendezvousId())
                    .orElseThrow(() -> new NotFoundException("Nouveau Rendezvous non trouvé."));
            existingPrescription.setRendezvous(newRendezvous);
        }

        existingPrescription.setPrescriptionDate(requestDto.getPrescriptionDate() != null ? requestDto.getPrescriptionDate() : existingPrescription.getPrescriptionDate());
        existingPrescription.setMedicament(requestDto.getMedicament() != null ? requestDto.getMedicament() : existingPrescription.getMedicament());
        existingPrescription.setPosologie(requestDto.getPosologie() != null ? requestDto.getPosologie() : existingPrescription.getPosologie());
        existingPrescription.setDosage(requestDto.getDosage() != null ? requestDto.getDosage() : existingPrescription.getDosage());
        existingPrescription.setEffective(requestDto.getEffective() != null ? requestDto.getEffective() : existingPrescription.getEffective());

        Prescription updatedPrescription = prescriptionRepository.save(existingPrescription);
        return PrescriptionDto.fromEntity(updatedPrescription);
    }

    @Override
    public void deletePrescription(Integer id) {
        Prescription prescription = prescriptionRepository.findById(id).orElseThrow(() -> new NotFoundException("Prescription non trouvée avec l'ID : " + id));
        prescriptionRepository.delete(prescription);
    }

    @Override
    public List<PrescriptionDto> getAllPrescriptions() {
        return prescriptionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(PrescriptionDto::fromEntity)
                .toList();
    }

    public org.springframework.data.domain.Page<PrescriptionDto> getAllPrescriptionsPaginated(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, 
            org.springframework.data.domain.Sort.by("createdAt").descending());
        return prescriptionRepository.findAll(pageable).map(PrescriptionDto::fromEntity);
    }

    @Override
    public List<PrescriptionDto> getPrescriptionsByRendezvousId(Integer rendezvousId) {
        List<Prescription> prescriptions = prescriptionRepository.findByRendezvousId(rendezvousId);
        return Optional.of(prescriptions)
                .filter(elt-> !elt.isEmpty())
                .orElseThrow(() -> new EntityNotFoundException("EMPTY LIST"))
                .stream()
                .map(PrescriptionDto::fromEntity)
                .toList();
    }

    @Override
    public List<PrescriptionDto> getPrescriptionsByMedecinId(Integer medecinId) {
        try {
            return prescriptionRepository.findByRendezvousMedecinIdOrderByCreatedAtDesc(medecinId)
                    .stream()
                    .map(PrescriptionDto::fromEntity)
                    .toList();
        } catch (Exception e) {
            System.err.println("Erreur getPrescriptionsByMedecinId: " + e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    public org.springframework.data.domain.Page<PrescriptionDto> getPrescriptionsByMedecinIdPaginated(Integer medecinId, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return prescriptionRepository.findByRendezvousMedecinIdOrderByCreatedAtDesc(medecinId, pageable)
                .map(PrescriptionDto::fromEntity);
    }

    @Override
    public List<PrescriptionDto> createMultiplePrescriptions(MultiplePrescriptionRequestDto requestDto) {
        if (requestDto.getRendezvousId() == null) {
            throw new BusinessException("L'ID du rendez-vous est requis");
        }
        
        if (requestDto.getMedicaments() == null || requestDto.getMedicaments().isEmpty()) {
            throw new BusinessException("Au moins un médicament est requis");
        }

        Rendezvous rendezvous = rendezvousRepository.findById(requestDto.getRendezvousId())
                .orElseThrow(() -> new NotFoundException("Rendezvous non trouvé avec l'ID : " + requestDto.getRendezvousId()));

        List<PrescriptionDto> createdPrescriptions = new java.util.ArrayList<>();
        
        for (MultiplePrescriptionRequestDto.MedicamentDto medicament : requestDto.getMedicaments()) {
            if (medicament.getMedicament() == null || medicament.getMedicament().trim().isEmpty()) {
                continue;
            }
            
            Prescription prescription = new Prescription();
            prescription.setPrescriptionDate(requestDto.getPrescriptionDate() != null ? 
                LocalDate.parse(requestDto.getPrescriptionDate()) : LocalDate.now());
            prescription.setMedicament(medicament.getMedicament());
            prescription.setPosologie(medicament.getPosologie());
            prescription.setDosage(medicament.getDosage());
            prescription.setEffective(requestDto.getEffective() != null ? requestDto.getEffective() : true);
            prescription.setHospitalisationNecessaire(requestDto.getHospitalisationNecessaire());
            prescription.setExamensNecessaires(requestDto.getExamensNecessaires());
            prescription.setRendezvous(rendezvous);

            Prescription savedPrescription = prescriptionRepository.save(prescription);
            createdPrescriptions.add(PrescriptionDto.fromEntity(savedPrescription));
            
            // Notification email pour chaque prescription
            if (rendezvous.getPatient().getEmail() != null) {
                notificationService.sendPrescriptionNotification(savedPrescription);
            }
        }
        
        return createdPrescriptions;
    }

    @Override
    public byte[] generatePrescriptionPdf(Integer prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new NotFoundException("Prescription non trouvée pour générer le PDF avec l'ID : " + prescriptionId));

        // Récupérer toutes les prescriptions du même rendez-vous
        List<Prescription> allPrescriptions = prescriptionRepository.findByRendezvousId(prescription.getRendezvous().getId());

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

                // En-tête
                contentStream.setStrokingColor(0.2f, 0.4f, 0.8f);
                contentStream.setLineWidth(3);
                contentStream.moveTo(margin, yPosition - 10);
                contentStream.lineTo(pageWidth - margin, yPosition - 10);
                contentStream.stroke();
                
                String title = "PRESCRIPTION MÉDICALE";
                contentStream.beginText();
                contentStream.setFont(fontBold, 28);
                contentStream.setNonStrokingColor(0.2f, 0.4f, 0.8f);
                float titleWidth = fontBold.getStringWidth(title) / 1000 * 28;
                contentStream.newLineAtOffset((pageWidth - titleWidth) / 2, yPosition - 40);
                contentStream.showText(title);
                contentStream.endText();
                yPosition -= 80;

                // Informations médecin et patient
                Medecin medecin = prescription.getRendezvous().getMedecin();
                Patient patient = prescription.getRendezvous().getPatient();
                
                contentStream.setNonStrokingColor(0, 0, 0);
                drawInfoBox(contentStream, fontBold, font, margin, yPosition, 
                    "MÉDECIN PRESCRIPTEUR",
                    "Dr. " + medecin.getPrenom() + " " + medecin.getNom(),
                    medecin.getSpecialite() != null ? medecin.getSpecialite() : "Médecin Généraliste",
                    "");
                yPosition -= 100;

                drawInfoBox(contentStream, fontBold, font, margin, yPosition,
                    "PATIENT",
                    patient.getPrenom() + " " + patient.getNom(),
                    patient.getDateNaissance() != null ? "Né(e) le: " + patient.getDateNaissance() : "",
                    "");
                yPosition -= 120;

                // Date
                contentStream.beginText();
                contentStream.setFont(font, 12);
                contentStream.newLineAtOffset(pageWidth - margin - 150, yPosition);
                contentStream.showText("Date: " + prescription.getPrescriptionDate());
                contentStream.endText();
                yPosition -= 40;

                // Tableau des médicaments
                yPosition = drawMedicamentsTable(contentStream, fontBold, font, margin, yPosition, pageWidth - 2 * margin, allPrescriptions);
                yPosition -= 40;

                // Hospitalisation et examens
                if (prescription.getHospitalisationNecessaire() != null && prescription.getHospitalisationNecessaire()) {
                    drawWarningBox(contentStream, fontBold, font, margin, yPosition, "🏥 HOSPITALISATION NÉCESSAIRE");
                    yPosition -= 60;
                }

                if (prescription.getExamensNecessaires() != null && !prescription.getExamensNecessaires().trim().isEmpty()) {
                    drawExamensBox(contentStream, fontBold, font, margin, yPosition, pageWidth - 2 * margin, prescription.getExamensNecessaires());
                    yPosition -= 80;
                }

                // Signature
                contentStream.setStrokingColor(0.8f, 0.8f, 0.8f);
                contentStream.setLineWidth(1);
                contentStream.moveTo(pageWidth - margin - 200, yPosition);
                contentStream.lineTo(pageWidth - margin, yPosition);
                contentStream.stroke();
                
                contentStream.beginText();
                contentStream.setFont(font, 10);
                contentStream.newLineAtOffset(pageWidth - margin - 150, yPosition - 20);
                contentStream.showText("Signature du médecin");
                contentStream.endText();

                // Pied de page
                contentStream.setNonStrokingColor(0.5f, 0.5f, 0.5f);
                contentStream.beginText();
                contentStream.setFont(font, 8);
                contentStream.newLineAtOffset(margin, 30);
                contentStream.showText("Prescription générée le " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm")));
                contentStream.endText();
            }

            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            document.save(byteArrayOutputStream);
            return byteArrayOutputStream.toByteArray();

        } catch (IOException e) {
            throw new BusinessException("Erreur lors de la génération du PDF de la prescription : " + e.getMessage());
        }
    }

    private void drawInfoBox(PDPageContentStream contentStream, PDType1Font fontBold, PDType1Font font,
                            float x, float y, String title, String line1, String line2, String line3) throws IOException {
        contentStream.setStrokingColor(0.8f, 0.8f, 0.8f);
        contentStream.setLineWidth(1);
        contentStream.addRect(x, y - 70, 250, 70);
        contentStream.stroke();
        
        contentStream.beginText();
        contentStream.setFont(fontBold, 10);
        contentStream.setNonStrokingColor(0.2f, 0.4f, 0.8f);
        contentStream.newLineAtOffset(x + 5, y - 15);
        contentStream.showText(title);
        contentStream.endText();
        
        contentStream.setNonStrokingColor(0, 0, 0);
        contentStream.beginText();
        contentStream.setFont(fontBold, 12);
        contentStream.newLineAtOffset(x + 5, y - 30);
        contentStream.showText(line1);
        contentStream.endText();
        
        if (line2 != null && !line2.isEmpty()) {
            contentStream.beginText();
            contentStream.setFont(font, 10);
            contentStream.newLineAtOffset(x + 5, y - 45);
            contentStream.showText(line2);
            contentStream.endText();
        }
        
        if (line3 != null && !line3.isEmpty()) {
            contentStream.beginText();
            contentStream.setFont(font, 10);
            contentStream.newLineAtOffset(x + 5, y - 60);
            contentStream.showText(line3);
            contentStream.endText();
        }
    }
    
    private float drawMedicamentsTable(PDPageContentStream contentStream, PDType1Font fontBold, PDType1Font font,
                                      float x, float y, float width, List<Prescription> prescriptions) throws IOException {
        float tableHeight = 30 + (prescriptions.size() * 25);
        
        // Cadre du tableau
        contentStream.setStrokingColor(0.2f, 0.4f, 0.8f);
        contentStream.setLineWidth(2);
        contentStream.addRect(x, y - tableHeight, width, tableHeight);
        contentStream.stroke();
        
        // En-tête du tableau
        contentStream.setNonStrokingColor(0.2f, 0.4f, 0.8f);
        contentStream.addRect(x, y - 25, width, 25);
        contentStream.fill();
        
        contentStream.beginText();
        contentStream.setFont(fontBold, 14);
        contentStream.setNonStrokingColor(1, 1, 1);
        contentStream.newLineAtOffset(x + 10, y - 20);
        contentStream.showText("MÉDICAMENTS PRESCRITS");
        contentStream.endText();
        
        // Colonnes du tableau
        float col1 = width * 0.4f;
        float col2 = width * 0.2f;
        float col3 = width * 0.4f;
        
        contentStream.setNonStrokingColor(0, 0, 0);
        float yPos = y - 45;
        
        // En-têtes des colonnes
        contentStream.beginText();
        contentStream.setFont(fontBold, 10);
        contentStream.newLineAtOffset(x + 5, yPos);
        contentStream.showText("Médicament");
        contentStream.endText();
        
        contentStream.beginText();
        contentStream.setFont(fontBold, 10);
        contentStream.newLineAtOffset(x + col1 + 5, yPos);
        contentStream.showText("Dosage");
        contentStream.endText();
        
        contentStream.beginText();
        contentStream.setFont(fontBold, 10);
        contentStream.newLineAtOffset(x + col1 + col2 + 5, yPos);
        contentStream.showText("Posologie");
        contentStream.endText();
        
        // Lignes verticales
        contentStream.setStrokingColor(0.8f, 0.8f, 0.8f);
        contentStream.setLineWidth(1);
        contentStream.moveTo(x + col1, y - 25);
        contentStream.lineTo(x + col1, y - tableHeight);
        contentStream.stroke();
        
        contentStream.moveTo(x + col1 + col2, y - 25);
        contentStream.lineTo(x + col1 + col2, y - tableHeight);
        contentStream.stroke();
        
        yPos -= 20;
        
        // Données des médicaments
        for (Prescription prescription : prescriptions) {
            contentStream.beginText();
            contentStream.setFont(font, 9);
            contentStream.newLineAtOffset(x + 5, yPos);
            contentStream.showText(prescription.getMedicament() != null ? prescription.getMedicament() : "Non spécifié");
            contentStream.endText();
            
            contentStream.beginText();
            contentStream.setFont(font, 9);
            contentStream.newLineAtOffset(x + col1 + 5, yPos);
            contentStream.showText(prescription.getDosage() != null ? prescription.getDosage() : "Non spécifié");
            contentStream.endText();
            
            contentStream.beginText();
            contentStream.setFont(font, 9);
            contentStream.newLineAtOffset(x + col1 + col2 + 5, yPos);
            contentStream.showText(prescription.getPosologie() != null ? prescription.getPosologie() : "Non spécifiée");
            contentStream.endText();
            
            yPos -= 25;
        }
        
        return y - tableHeight;
    }
    
    private void drawWarningBox(PDPageContentStream contentStream, PDType1Font fontBold, PDType1Font font,
                               float x, float y, String text) throws IOException {
        contentStream.setStrokingColor(1.0f, 0.6f, 0.0f);
        contentStream.setLineWidth(2);
        contentStream.addRect(x, y - 40, 300, 40);
        contentStream.stroke();
        
        contentStream.setNonStrokingColor(1.0f, 0.9f, 0.7f);
        contentStream.addRect(x, y - 40, 300, 40);
        contentStream.fill();
        
        contentStream.beginText();
        contentStream.setFont(fontBold, 12);
        contentStream.setNonStrokingColor(0.8f, 0.4f, 0.0f);
        contentStream.newLineAtOffset(x + 10, y - 25);
        contentStream.showText(text);
        contentStream.endText();
    }
    
    private void drawExamensBox(PDPageContentStream contentStream, PDType1Font fontBold, PDType1Font font,
                               float x, float y, float width, String examens) throws IOException {
        contentStream.setStrokingColor(0.0f, 0.6f, 0.8f);
        contentStream.setLineWidth(2);
        contentStream.addRect(x, y - 60, width, 60);
        contentStream.stroke();
        
        contentStream.setNonStrokingColor(0.9f, 0.95f, 1.0f);
        contentStream.addRect(x, y - 60, width, 60);
        contentStream.fill();
        
        contentStream.beginText();
        contentStream.setFont(fontBold, 12);
        contentStream.setNonStrokingColor(0.0f, 0.4f, 0.6f);
        contentStream.newLineAtOffset(x + 10, y - 20);
        contentStream.showText("🔬 EXAMENS NÉCESSAIRES");
        contentStream.endText();
        
        contentStream.beginText();
        contentStream.setFont(font, 10);
        contentStream.setNonStrokingColor(0, 0, 0);
        contentStream.newLineAtOffset(x + 10, y - 40);
        contentStream.showText(examens);
        contentStream.endText();
    }
}