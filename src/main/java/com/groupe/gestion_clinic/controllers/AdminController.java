package com.groupe.gestion_clinic.controllers;

import com.groupe.gestion_clinic.model.*;
import com.groupe.gestion_clinic.repositories.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4203")
@RequiredArgsConstructor
public class AdminController {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/reset")
    public ResponseEntity<?> resetAdmin() {
        try {
            // Supprimer tous les utilisateurs
            utilisateurRepository.deleteAll();
            
            // Créer un nouvel admin
            Administrateur admin = new Administrateur();
            admin.setNom("Super");
            admin.setPrenom("Admin");
            admin.setEmail("admin@clinic.com");
            admin.setMotDePasse(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            
            utilisateurRepository.save(admin);
            
            return ResponseEntity.ok("Admin reset: email=admin@clinic.com, password=admin123");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        var users = utilisateurRepository.findAll();
        var userDtos = users.stream().map(user -> {
            var dto = new java.util.HashMap<String, Object>();
            dto.put("id", user.getId());
            dto.put("nom", user.getNom());
            dto.put("prenom", user.getPrenom());
            dto.put("email", user.getEmail());
            dto.put("role", user.getRole().toString());
            return dto;
        }).toList();
        return ResponseEntity.ok(userDtos);
    }

    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody java.util.Map<String, Object> userData) {
        try {
            String role = (String) userData.get("role");
            String nom = (String) userData.get("nom");
            String prenom = (String) userData.get("prenom");
            String email = (String) userData.get("email");
            String motDePasse = (String) userData.get("motDePasse");

            if (utilisateurRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body("Email déjà utilisé");
            }

            Utilisateur user;
            Role userRole = Role.valueOf(role);
            
            switch (userRole) {
                case ADMIN:
                    user = new Administrateur();
                    break;
                case MEDECIN:
                    user = new Medecin();
                    break;
                case SECRETAIRE:
                    user = new Secretaire();
                    break;
                default:
                    return ResponseEntity.badRequest().body("Rôle non supporté: " + role);
            }
            
            user.setNom(nom);
            user.setPrenom(prenom);
            user.setEmail(email);
            user.setMotDePasse(passwordEncoder.encode(motDePasse));
            user.setRole(userRole);
            
            return ResponseEntity.ok(utilisateurRepository.save(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> userData) {
        try {
            var userOpt = utilisateurRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            var user = userOpt.get();
            String nom = (String) userData.get("nom");
            String prenom = (String) userData.get("prenom");
            String email = (String) userData.get("email");
            String role = (String) userData.get("role");
            
            user.setNom(nom);
            user.setPrenom(prenom);
            user.setEmail(email);
            user.setRole(Role.valueOf(role));
            
            return ResponseEntity.ok(utilisateurRepository.save(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        try {
            utilisateurRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }
}