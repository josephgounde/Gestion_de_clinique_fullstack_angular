package com.groupe.gestion_clinic.controllers;

import com.groupe.gestion_clinic.dto.RendezvousDto;
import com.groupe.gestion_clinic.dto.RendezvousSearchDto;
import com.groupe.gestion_clinic.model.StatutRendezVous;
import com.groupe.gestion_clinic.services.RendezvousServiceNew;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/rendezvous")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4203"})
public class RendezvousController {

    private final RendezvousServiceNew rendezvousService;
    
    public RendezvousController(@Qualifier("rendezvousServiceNew") RendezvousServiceNew rendezvousService) {
        this.rendezvousService = rendezvousService;
    }

    @PostMapping("/create")
    public ResponseEntity<RendezvousDto> createRendezVous(@RequestBody Object requestDto) {
        try {
            RendezvousDto result = rendezvousService.createRendezVous(requestDto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Erreur lors de la création du rendez-vous: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<RendezvousDto> updateRendezVous(@PathVariable Integer id, @RequestBody Object requestDto) {
        return ResponseEntity.ok(rendezvousService.updateRendezVous(id, requestDto));
    }

    @PutMapping("/update-status/{id}")
    public ResponseEntity<RendezvousDto> updateRendezVousStatus(@PathVariable Integer id, @RequestParam String statut) {
        StatutRendezVous statutEnum = StatutRendezVous.valueOf(statut);
        RendezvousDto result = rendezvousService.updateRendezVousStatus(id, statutEnum);
        return ResponseEntity.ok(result);
    }


    @DeleteMapping("/cancel/{id}")
    public ResponseEntity<Void> cancelRendezVous(@PathVariable Integer id) {
        return ResponseEntity.ok(rendezvousService.cancelRendezVous(id));
    }
    @DeleteMapping("/delete/{rendezvousId}")
    public ResponseEntity<Void> deleteRendezVous(@PathVariable Integer rendezvousId) {
        rendezvousService.deleteRendezVous(rendezvousId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RendezvousDto> getRendezVousById(@PathVariable Integer id) {
        return ResponseEntity.ok(rendezvousService.getRendezVousById(id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<RendezvousDto>> getAllRendezVous() {
        return ResponseEntity.ok(rendezvousService.getAllRendezVous());
    }

    @GetMapping("/all/paginated")
    public ResponseEntity<org.springframework.data.domain.Page<RendezvousDto>> getAllRendezVousPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(rendezvousService.getAllRendezVousPaginated(page, size));
    }

    @GetMapping("/all/upcoming")
    public ResponseEntity<List<RendezvousDto>> getUpcomingRendezVousForMedecin() {
        return ResponseEntity.ok(rendezvousService.getUpcomingRendezVousForMedecin());
    }


    @GetMapping("/between-dates")
    public ResponseEntity<List<RendezvousDto>> getRendezVousBetweenDates(
                                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
                                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
                                @RequestParam(required = false)  Integer medecinId) {
        return ResponseEntity.ok(rendezvousService.getRendezVousBetweenDates(start, end, medecinId));
    }


    @PostMapping("/all/search")
    public ResponseEntity<List<RendezvousDto>> searchRendezVous(@RequestBody RendezvousSearchDto searchDTO) {
        return ResponseEntity.ok(rendezvousService.searchRendezVous(searchDTO));
    }


}
