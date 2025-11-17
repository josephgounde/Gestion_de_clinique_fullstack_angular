package com.groupe.gestion_clinic.services;

import com.groupe.gestion_clinic.model.Utilisateur;


public interface UtilisateurService {
    public Utilisateur getUtilisateurByEmail(String email);
}
