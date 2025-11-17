package com.groupe.gestion_clinic.controllers;

import com.groupe.gestion_clinic.model.AuditLog;
import com.groupe.gestion_clinic.repositories.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "http://localhost:4203")
@RequiredArgsConstructor
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping("/logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        List<AuditLog> logs = auditLogRepository.findAll();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/logs/recent")
    public ResponseEntity<List<AuditLog>> getRecentLogs() {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        List<AuditLog> logs = auditLogRepository.findByDateActionBetween(since, LocalDateTime.now());
        return ResponseEntity.ok(logs);
    }
}