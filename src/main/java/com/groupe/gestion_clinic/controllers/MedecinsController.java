package com.groupe.gestion_clinic.controllers;

import com.groupe.gestion_clinic.dto.MedecinDto;
import com.groupe.gestion_clinic.services.MedecinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medecins")
@CrossOrigin(origins = "http://localhost:4203")
@RequiredArgsConstructor
public class MedecinsController {
    
    private final MedecinService medecinService;

    @GetMapping
    public ResponseEntity<List<MedecinDto>> getAllMedecins() {
        return ResponseEntity.ok(medecinService.findAll());
    }
}