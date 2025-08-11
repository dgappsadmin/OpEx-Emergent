package com.opex.controller;

import com.opex.model.Initiative;
import com.opex.model.InitiativeSite;
import com.opex.model.InitiativeDiscipline;
import com.opex.service.InitiativeService;
import com.opex.service.InitiativeSiteService;
import com.opex.service.InitiativeDisciplineService;
import com.opex.dto.CreateInitiativeRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/initiatives")
public class InitiativeController {

    @Autowired
    private InitiativeService initiativeService;

    @Autowired
    private InitiativeSiteService siteService;

    @Autowired
    private InitiativeDisciplineService disciplineService;

    @GetMapping
    public List<Initiative> getAllInitiatives() {
        return initiativeService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Initiative> getInitiativeById(@PathVariable Long id) {
        Optional<Initiative> initiative = initiativeService.findById(id);
        return initiative.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/initiative-id/{initiativeId}")
    public ResponseEntity<Initiative> getInitiativeByInitiativeId(@PathVariable String initiativeId) {
        Optional<Initiative> initiative = initiativeService.findByInitiativeId(initiativeId);
        return initiative.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Initiative> createInitiative(@RequestBody CreateInitiativeRequest request) {
        try {
            // Get site and discipline from lookup tables
            Optional<InitiativeSite> site = siteService.findById(request.getSiteId());
            Optional<InitiativeDiscipline> discipline = disciplineService.findById(request.getDisciplineId());
            
            if (!site.isPresent() || !discipline.isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            
            // Create new initiative
            Initiative initiative = new Initiative();
            initiative.setTitle(request.getTitle());
            initiative.setDescription(request.getDescription());
            initiative.setCategory(request.getCategory());
            initiative.setSite(site.get());
            initiative.setDiscipline(discipline.get());
            initiative.setProposer(request.getProposer());
            initiative.setProposalDate(request.getProposalDate());
            initiative.setExpectedClosureDate(request.getExpectedClosureDate());
            initiative.setEstimatedSavings(request.getEstimatedSavings());
            initiative.setStatus("PROPOSED");
            initiative.setPriority(request.getPriority());
            initiative.setBudgetType(request.getBudgetType());
            initiative.setComments(request.getComments());
            
            Initiative savedInitiative = initiativeService.save(initiative);
            return ResponseEntity.ok(savedInitiative);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Initiative> updateInitiative(@PathVariable Long id, @RequestBody Initiative initiative) {
        Optional<Initiative> existingInitiative = initiativeService.findById(id);
        if (existingInitiative.isPresent()) {
            initiative.setId(id);
            Initiative updated = initiativeService.save(initiative);
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInitiative(@PathVariable Long id) {
        initiativeService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status/{status}")
    public List<Initiative> getInitiativesByStatus(@PathVariable String status) {
        return initiativeService.findByStatus(status);
    }

    @GetMapping("/site/{siteCode}")
    public List<Initiative> getInitiativesBySite(@PathVariable String siteCode) {
        return initiativeService.findBySiteCode(siteCode);
    }

    @GetMapping("/stats/count/{status}")
    public ResponseEntity<Long> getCountByStatus(@PathVariable String status) {
        return ResponseEntity.ok(initiativeService.countByStatus(status));
    }

    @GetMapping("/stats/total-value")
    public ResponseEntity<Double> getTotalExpectedValue() {
        return ResponseEntity.ok(initiativeService.getTotalExpectedValue());
    }
}