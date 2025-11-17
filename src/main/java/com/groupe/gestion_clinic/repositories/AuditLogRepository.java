package com.groupe.gestion_clinic.repositories;

import com.groupe.gestion_clinic.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {
    
    List<AuditLog> findByUtilisateurEmailOrderByDateActionDesc(String email);
    
    @Query("SELECT a FROM AuditLog a WHERE a.dateAction BETWEEN :start AND :end ORDER BY a.dateAction DESC")
    List<AuditLog> findByDateActionBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}