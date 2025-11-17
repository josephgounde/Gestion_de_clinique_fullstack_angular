package com.groupe.gestion_clinic.controllers;

import com.groupe.gestion_clinic.dto.MedecinDto;
import com.groupe.gestion_clinic.services.MedecinService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Medecin Management", description = "Operations related to Medecin management")
@RestController
@RequestMapping("/api/medecin")
@CrossOrigin(origins = "http://localhost:4203")
@RequiredArgsConstructor
public class MedecinController {
    private final MedecinService medecinService;

    @Operation(summary = "Create a new Medecin", description = "Saves a new Medecin entity")
    @PostMapping("/save")
    public ResponseEntity<MedecinDto> saveMedecin(@RequestBody MedecinDto medecinDto) {
        return ResponseEntity.ok(medecinService.createMedecin(medecinDto));
    }

    @Operation(summary = "Update an existing Medecin", description = "Updates an existing Medecin entity by ID")
    @PutMapping("/{medecinId}")
    public ResponseEntity<MedecinDto> updateMedecin( @PathVariable Integer medecinId, @RequestBody MedecinDto medecinDto) {
        return ResponseEntity.ok(medecinService.updateMedecin(medecinId, medecinDto));
    }

    @Operation(summary = "Find Medecin by ID", description = "Retrieves a Medecin entity by its ID")
    @GetMapping("/{medecinId}")
    public ResponseEntity<MedecinDto> findMedecinById( @PathVariable Integer medecinId) {
        return ResponseEntity.ok(medecinService.findById(medecinId));
    }


    @Operation(summary = "Find all Medecins", description = "Retrieves a list of all Medecin entities")
    @GetMapping("/all")
    public ResponseEntity<List<MedecinDto>> findAllMedecin(){
        return ResponseEntity.ok(medecinService.findAll());
    }

    // Endpoint pour compatibilité avec le frontend
    @GetMapping
    public ResponseEntity<List<MedecinDto>> getAllMedecins(){
        return ResponseEntity.ok(medecinService.findAll());
    }


    @Operation(summary = "Delete Medecin by ID", description = "Deletes a Medecin entity by its ID")
    @DeleteMapping("/{medecinId}")
    public ResponseEntity<Void> deleteMedecin(@PathVariable Integer medecinId) {
        medecinService.deleteMedecin(medecinId);
        return ResponseEntity.noContent().build();
    }
}
