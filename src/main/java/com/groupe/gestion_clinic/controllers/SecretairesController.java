package com.groupe.gestion_clinic.controllers;

import com.groupe.gestion_clinic.dto.SecretaireDto;
import com.groupe.gestion_clinic.services.SecretaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/secretaires")
@CrossOrigin(origins = "http://localhost:4203")
@RequiredArgsConstructor
public class SecretairesController {
    
    private final SecretaireService secretaireService;

    @GetMapping
    public ResponseEntity<List<SecretaireDto>> getAllSecretaires() {
        return ResponseEntity.ok(secretaireService.findAll());
    }
}