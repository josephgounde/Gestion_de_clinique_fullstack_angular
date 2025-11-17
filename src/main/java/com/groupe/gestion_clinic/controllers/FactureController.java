package com.groupe.gestion_clinic.controllers;

import com.groupe.gestion_clinic.dto.FactureDto;
import com.groupe.gestion_clinic.model.StatutFacture;
import com.groupe.gestion_clinic.services.FacturationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/factures")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4203"})
@RequiredArgsConstructor
public class FactureController {

    private final FacturationService facturationService;

    @PostMapping("/creer")
    public ResponseEntity<FactureDto> creerFacture(@RequestBody Map<String, Object> request) {
        Integer prescriptionId = (Integer) request.get("prescriptionId");
        BigDecimal fraisConsultation = new BigDecimal(request.get("fraisConsultation").toString());
        BigDecimal fraisHospitalisation = request.get("fraisHospitalisation") != null ? 
            new BigDecimal(request.get("fraisHospitalisation").toString()) : BigDecimal.ZERO;
        BigDecimal fraisExamen = request.get("fraisExamen") != null ? 
            new BigDecimal(request.get("fraisExamen").toString()) : BigDecimal.ZERO;
        
        FactureDto facture = facturationService.creerFacture(prescriptionId, fraisConsultation, 
                                                           fraisHospitalisation, fraisExamen);
        return ResponseEntity.ok(facture);
    }

    @GetMapping("/all")
    public ResponseEntity<List<FactureDto>> getAllFactures() {
        return ResponseEntity.ok(facturationService.getAllFactures());
    }

    @GetMapping("/revenus/{annee}")
    public ResponseEntity<Map<String, BigDecimal>> getRevenuAnnuel(@PathVariable int annee) {
        BigDecimal revenu = facturationService.getRevenuAnnuel(annee);
        return ResponseEntity.ok(Map.of("revenuAnnuel", revenu, "annee", BigDecimal.valueOf(annee)));
    }

    @GetMapping("/revenus/{annee}/{mois}")
    public ResponseEntity<Map<String, Object>> getRevenuMensuel(@PathVariable int annee, @PathVariable int mois) {
        BigDecimal revenu = facturationService.getRevenuMensuel(annee, mois);
        return ResponseEntity.ok(Map.of(
            "revenuMensuel", revenu,
            "annee", annee,
            "mois", mois
        ));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getFacturePdf(@PathVariable Integer id) {
        byte[] pdfBytes = facturationService.generateFacturePdf(id);
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "facture_" + id + ".pdf");
        
        return new ResponseEntity<>(pdfBytes, headers, org.springframework.http.HttpStatus.OK);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<FactureDto> updateFactureStatus(@PathVariable Integer id, @RequestParam String statut) {
        FactureDto facture = facturationService.updateFactureStatus(id, StatutFacture.valueOf(statut));
        return ResponseEntity.ok(facture);
    }
}