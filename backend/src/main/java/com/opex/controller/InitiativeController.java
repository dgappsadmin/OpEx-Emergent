package com.opex.controller;

import com.opex.dto.CreateInitiativeRequest;
import com.opex.dto.MessageResponse;
import com.opex.model.Initiative;
import com.opex.model.InitiativeSite;
import com.opex.model.InitiativeDiscipline;
import com.opex.service.InitiativeService;
import com.opex.service.InitiativeSiteService;
import com.opex.service.InitiativeDisciplineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
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
    public ResponseEntity<List<Initiative>> getAllInitiatives() {
        List<Initiative> initiatives = initiativeService.findAll();
        return ResponseEntity.ok(initiatives);
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

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Initiative>> getInitiativesByStatus(@PathVariable String status) {
        List<Initiative> initiatives = initiativeService.findByStatus(status);
        return ResponseEntity.ok(initiatives);
    }

    @GetMapping("/site/{siteCode}")
    public ResponseEntity<List<Initiative>> getInitiativesBySite(@PathVariable String siteCode) {
        List<Initiative> initiatives = initiativeService.findBySite(siteCode);
        return ResponseEntity.ok(initiatives);
    }

    @GetMapping("/stats/count/{status}")
    public ResponseEntity<Long> getInitiativeCountByStatus(@PathVariable String status) {
        long count = initiativeService.countByStatus(status);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/stats/total-value")
    public ResponseEntity<Double> getTotalEstimatedSavings() {
        double total = initiativeService.getTotalEstimatedSavings();
        return ResponseEntity.ok(total);
    }

    @PostMapping
    public ResponseEntity<?> createInitiative(@Valid @RequestBody CreateInitiativeRequest request) {
        try {
            // Find site - try by code first, then by ID
            Optional<InitiativeSite> site = Optional.empty();
            if (request.getSiteCode() != null && !request.getSiteCode().isEmpty()) {
                site = siteService.findByCode(request.getSiteCode());
            } else if (request.getSiteId() != null) {
                site = siteService.findById(request.getSiteId());
            }
            
            if (!site.isPresent()) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Site not found!"));
            }

            // Find discipline - try by code first, then by ID
            Optional<InitiativeDiscipline> discipline = Optional.empty();
            if (request.getDisciplineCode() != null && !request.getDisciplineCode().isEmpty()) {
                discipline = disciplineService.findByCode(request.getDisciplineCode());
            } else if (request.getDisciplineId() != null) {
                discipline = disciplineService.findById(request.getDisciplineId());
            }
            
            if (!discipline.isPresent()) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Discipline not found!"));
            }

            // Create initiative
            Initiative initiative = new Initiative();
            initiative.setTitle(request.getTitle());
            initiative.setDescription(request.getDescription());
            initiative.setCategory(request.getCategory());
            initiative.setSite(site.get());
            initiative.setDiscipline(discipline.get());
            initiative.setProposer(request.getProposer());
            initiative.setProposalDate(request.getProposalDate() != null ? request.getProposalDate() : LocalDate.now());
            initiative.setExpectedClosureDate(request.getExpectedClosureDate());
            initiative.setEstimatedSavings(request.getEstimatedSavings());
            initiative.setStatus("PROPOSED"); // Always start as PROPOSED
            initiative.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
            initiative.setBudgetType(request.getBudgetType() != null ? request.getBudgetType() : "BUDGETED");
            initiative.setComments(request.getComments());

            // Save initiative (this will automatically create workflow steps)
            Initiative savedInitiative = initiativeService.save(initiative);

            return ResponseEntity.ok(savedInitiative);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: Could not create initiative. " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInitiative(@PathVariable Long id, @Valid @RequestBody CreateInitiativeRequest request) {
        try {
            Optional<Initiative> existingInitiative = initiativeService.findById(id);
            if (!existingInitiative.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Initiative initiative = existingInitiative.get();
            
            // Update fields
            initiative.setTitle(request.getTitle());
            initiative.setDescription(request.getDescription());
            initiative.setCategory(request.getCategory());
            
            // Update site if provided
            if (request.getSiteCode() != null && !request.getSiteCode().isEmpty()) {
                Optional<InitiativeSite> site = siteService.findByCode(request.getSiteCode());
                if (site.isPresent()) {
                    initiative.setSite(site.get());
                }
            } else if (request.getSiteId() != null) {
                Optional<InitiativeSite> site = siteService.findById(request.getSiteId());
                if (site.isPresent()) {
                    initiative.setSite(site.get());
                }
            }
            
            // Update discipline if provided
            if (request.getDisciplineCode() != null && !request.getDisciplineCode().isEmpty()) {
                Optional<InitiativeDiscipline> discipline = disciplineService.findByCode(request.getDisciplineCode());
                if (discipline.isPresent()) {
                    initiative.setDiscipline(discipline.get());
                }
            } else if (request.getDisciplineId() != null) {
                Optional<InitiativeDiscipline> discipline = disciplineService.findById(request.getDisciplineId());
                if (discipline.isPresent()) {
                    initiative.setDiscipline(discipline.get());
                }
            }
            
            if (request.getExpectedClosureDate() != null) {
                initiative.setExpectedClosureDate(request.getExpectedClosureDate());
            }
            if (request.getEstimatedSavings() != null) {
                initiative.setEstimatedSavings(request.getEstimatedSavings());
            }
            if (request.getPriority() != null) {
                initiative.setPriority(request.getPriority());
            }
            if (request.getBudgetType() != null) {
                initiative.setBudgetType(request.getBudgetType());
            }
            if (request.getComments() != null) {
                initiative.setComments(request.getComments());
            }

            Initiative savedInitiative = initiativeService.save(initiative);
            return ResponseEntity.ok(savedInitiative);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: Could not update initiative. " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInitiative(@PathVariable Long id) {
        try {
            Optional<Initiative> initiative = initiativeService.findById(id);
            if (!initiative.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            initiativeService.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Initiative deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: Could not delete initiative. " + e.getMessage()));
        }
    }
}