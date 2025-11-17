package com.groupe.gestion_clinic.services;

import com.groupe.gestion_clinic.dto.FactureDto;

import java.math.BigDecimal;
import java.util.List;

public interface FacturationService {
    FactureDto creerFacture(Integer prescriptionId, BigDecimal fraisConsultation, 
                           BigDecimal fraisHospitalisation, BigDecimal fraisExamen);
    List<FactureDto> getAllFactures();
    BigDecimal getRevenuAnnuel(int annee);
    BigDecimal getRevenuMensuel(int annee, int mois);
    byte[] generateFacturePdf(Integer factureId);
    FactureDto updateFactureStatus(Integer factureId, com.groupe.gestion_clinic.model.StatutFacture statut);
}
