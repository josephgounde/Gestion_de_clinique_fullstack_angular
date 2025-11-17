package com.groupe.gestion_clinic.security;


import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.groupe.gestion_clinic.model.Administrateur;
import com.groupe.gestion_clinic.model.Role;
import com.groupe.gestion_clinic.repositories.UtilisateurRepository;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class InitAdminConfig {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initAdmin() {
        return args -> {
            System.out.println("Verification des utilisateurs existants: " + utilisateurRepository.count());
            
            // Afficher tous les utilisateurs existants
            utilisateurRepository.findAll().forEach(user -> 
                System.out.println("Utilisateur existant: " + user.getEmail() + " - Role: " + user.getRole())
            );
            
            // Créer admin@test.com seulement s'il n'existe pas déjà
            String testAdminEmail = "admin@test.com";
            if (utilisateurRepository.findByEmail(testAdminEmail).isEmpty()) {
                Administrateur testAdmin = new Administrateur();
                testAdmin.setNom("Test");
                testAdmin.setPrenom("Admin");
                testAdmin.setEmail(testAdminEmail);
                testAdmin.setMotDePasse(passwordEncoder.encode("test123"));
                testAdmin.setRole(Role.ADMIN);
                
                try {
                    utilisateurRepository.save(testAdmin);
                    System.out.println("=== ADMIN TEST CREE: email=admin@test.com, password=test123 ===");
                } catch (Exception e) {
                    System.out.println("Erreur creation admin: " + e.getMessage());
                }
            } else {
                System.out.println("=== ADMIN TEST DEJA EXISTANT: email=admin@test.com ===");
            }
        };
    }
}
