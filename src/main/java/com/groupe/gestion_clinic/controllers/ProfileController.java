package com.groupe.gestion_clinic.controllers;

import com.groupe.gestion_clinic.repositories.UtilisateurRepository;
import com.groupe.gestion_clinic.security.JwtServiceUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:4203")
@RequiredArgsConstructor
public class ProfileController {

    private final UtilisateurRepository utilisateurRepository;
    private final JwtServiceUtil jwtUtil;

    @PutMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String avatarUrl = request.get("avatarUrl");
            if (avatarUrl == null || avatarUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("URL d'avatar requise");
            }
            
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Token manquant");
            }
            
            String token = authHeader.substring(7);
            String userEmail = jwtUtil.extractUsername(token);
            
            var userOpt = utilisateurRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            var user = userOpt.get();
            user.setAvatarUrl(avatarUrl);
            utilisateurRepository.save(user);
            
            return ResponseEntity.ok(Map.of("message", "Avatar mis à jour", "avatarUrl", avatarUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }
}