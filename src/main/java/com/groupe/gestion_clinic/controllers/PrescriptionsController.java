package com.groupe.gestion_clinic.controllers;

import com.groupe.gestion_clinic.dto.PrescriptionDto;
import com.groupe.gestion_clinic.dto.requestDto.PrescriptionRequestDto;
import com.groupe.gestion_clinic.services.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class PrescriptionsController {

    private final PrescriptionService prescriptionService;

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<PrescriptionDto>> getPrescriptionsByMedecinId(@PathVariable Integer medecinId) {
        try {
            List<PrescriptionDto> prescriptions = prescriptionService.getPrescriptionsByMedecinId(medecinId);
            return ResponseEntity.ok(prescriptions);
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<PrescriptionDto>> getAllPrescriptions() {
        List<PrescriptionDto> prescriptions = prescriptionService.getAllPrescriptions();
        return ResponseEntity.ok(prescriptions);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPrescription(@RequestBody PrescriptionRequestDto requestDto) {
        try {
            PrescriptionDto createdPrescription = prescriptionService.createPrescription(requestDto);
            return new ResponseEntity<>(createdPrescription, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Erreur création prescription: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }
}