package com.groupe.gestion_clinic.controllers;

import com.groupe.gestion_clinic.dto.SecretaireDto;
import com.groupe.gestion_clinic.repositories.SecretaireRepository;
import com.groupe.gestion_clinic.services.SecretaireService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Secretaire Management", description = "Operations related to Secretaire management")
@RestController
@RequestMapping("/api/secretaire")
@RequiredArgsConstructor
public class SecretaireController {

    private final SecretaireService secretaireService;

    @Operation(summary = "Create a new Secretaire", description = "Saves a new Secretaire entity")
    @PostMapping("/save")
    public ResponseEntity<SecretaireDto> saveSecretaire(@RequestBody SecretaireDto dto) {
        SecretaireDto secretaireDto = secretaireService.createSecretaire(dto);
        return new ResponseEntity<>(secretaireDto, HttpStatus.CREATED);
    }

    @Operation(summary = "Find Secretaire by ID", description = "Retrieves a Secretaire entity by its ID")
    @PutMapping("/{secretaireId}")
    public ResponseEntity<SecretaireDto> updateSecretaire(@PathVariable Integer secretaireId, @RequestBody SecretaireDto dto) {
        return ResponseEntity.ok(secretaireService.updateSecretaire(secretaireId, dto));
    }

    @Operation(summary = "Find Secretaire by ID", description = "Retrieves a Secretaire entity by its ID")
    @GetMapping("/all")
    public ResponseEntity<List<SecretaireDto>> findAllSecretaire() {
        return ResponseEntity.ok(secretaireService.findAll());
    }

    @Operation(summary = "Find Secretaire by ID", description = "Retrieves a Secretaire entity by its ID")
    @DeleteMapping("/{secretaireId}")
    public ResponseEntity<?> deleteSecretaire(@PathVariable Integer secretaireId) {
        secretaireService.deleteSecretaire(secretaireId);
        return ResponseEntity.noContent().build();
    }

}
