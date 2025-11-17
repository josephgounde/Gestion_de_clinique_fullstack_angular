package com.groupe.gestion_clinic.controllers;

import com.groupe.gestion_clinic.security.JwtServiceUtil;
import com.groupe.gestion_clinic.services.AuditService;
import com.groupe.gestion_clinic.repositories.UtilisateurRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4203")
@RequiredArgsConstructor
public class AuthController {

    private final AuditService auditService;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtServiceUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest, HttpServletRequest request) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");
            
            var userOpt = utilisateurRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Utilisateur non trouvé");
            }
            
            var user = userOpt.get();
            if (!passwordEncoder.matches(password, user.getMotDePasse())) {
                return ResponseEntity.badRequest().body("Mot de passe incorrect");
            }
            
            String token = jwtUtil.generateToken(user);
            auditService.logLogin(user.getEmail(), user.getRole().toString(), request.getRemoteAddr());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", user.getRole().toString());
            response.put("nom", user.getNom());
            response.put("prenom", user.getPrenom());
            response.put("email", user.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur de connexion: " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication auth, HttpServletRequest request) {
        if (auth != null) {
            auditService.logLogout(auth.getName(), "USER", request.getRemoteAddr());
        }
        return ResponseEntity.ok().build();
    }
}