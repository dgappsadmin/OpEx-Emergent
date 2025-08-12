package com.opex.controller;

import com.opex.model.WorkflowStep;
import com.opex.model.WorkflowTransaction;
import com.opex.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/workflow")
public class WorkflowController {

    @Autowired
    private WorkflowService workflowService;

    @GetMapping("/initiative/{initiativeId}")
    public ResponseEntity<List<WorkflowStep>> getWorkflowByInitiativeId(@PathVariable Long initiativeId) {
        List<WorkflowStep> steps = workflowService.findByInitiativeId(initiativeId);
        
        // If no workflow steps exist, create them
        if (steps.isEmpty()) {
            try {
                steps = workflowService.createWorkflowStepsForInitiative(initiativeId);
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
        }
        
        return ResponseEntity.ok(steps);
    }

    @GetMapping("/status/{status}")
    public List<WorkflowStep> getWorkflowByStatus(@PathVariable String status) {
        return workflowService.findByStatus(status);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkflowStep> getWorkflowById(@PathVariable Long id) {
        Optional<WorkflowStep> workflow = workflowService.findById(id);
        return workflow.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{stepId}/approve")
    public ResponseEntity<WorkflowStep> approveStep(
            @PathVariable Long stepId, 
            @RequestBody Map<String, Object> requestData) {
        
        String comments = (String) requestData.get("comments");
        String signature = getCurrentUser(); // Get current user from security context
        
        // Prepare additional data
        Map<String, Object> additionalData = new HashMap<>();
        
        // Handle MOC data
        if (requestData.containsKey("mocRequired")) {
            additionalData.put("mocRequired", requestData.get("mocRequired"));
        }
        if (requestData.containsKey("mocNumber")) {
            additionalData.put("mocNumber", requestData.get("mocNumber"));
        }
        
        // Handle CAPEX data
        if (requestData.containsKey("capexRequired")) {
            additionalData.put("capexRequired", requestData.get("capexRequired"));
        }
        if (requestData.containsKey("capexDetails")) {
            additionalData.put("capexDetails", requestData.get("capexDetails"));
        }
        
        // Handle Initiative Lead selection
        if (requestData.containsKey("initiativeLead")) {
            additionalData.put("initiativeLead", requestData.get("initiativeLead"));
        }
        
        // Update the workflow step with additional data first
        Optional<WorkflowStep> stepOpt = workflowService.findById(stepId);
        if (stepOpt.isPresent()) {
            WorkflowStep step = stepOpt.get();
            
            // Set additional data on the step
            if (additionalData.containsKey("mocRequired")) {
                step.setMocRequired((Boolean) additionalData.get("mocRequired"));
                if ((Boolean) additionalData.get("mocRequired") && additionalData.containsKey("mocNumber")) {
                    step.setMocNumber((String) additionalData.get("mocNumber"));
                }
            }
            
            if (additionalData.containsKey("capexRequired")) {
                step.setCapexRequired((Boolean) additionalData.get("capexRequired"));
                if ((Boolean) additionalData.get("capexRequired") && additionalData.containsKey("capexDetails")) {
                    step.setCapexDetails((String) additionalData.get("capexDetails"));
                }
            }
            
            // Save the updated step first
            workflowService.save(step);
        }
        
        // Approve the step with transaction logging
        WorkflowStep approvedStep = workflowService.approveStep(stepId, comments, signature, additionalData);
        if (approvedStep != null) {
            return ResponseEntity.ok(approvedStep);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{stepId}/reject")
    public ResponseEntity<WorkflowStep> rejectStep(
            @PathVariable Long stepId, 
            @RequestBody Map<String, String> requestData) {
        
        String comments = requestData.get("comments");
        
        WorkflowStep rejectedStep = workflowService.rejectStep(stepId, comments);
        if (rejectedStep != null) {
            return ResponseEntity.ok(rejectedStep);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/transactions/{workflowId}")
    public ResponseEntity<List<WorkflowTransaction>> getWorkflowHistory(@PathVariable String workflowId) {
        List<WorkflowTransaction> transactions = workflowService.getWorkflowHistory(workflowId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/pending/{userEmail}")
    public ResponseEntity<List<WorkflowTransaction>> getPendingTransactions(@PathVariable String userEmail) {
        List<WorkflowTransaction> transactions = workflowService.getPendingTransactions(userEmail);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/create-steps/{initiativeId}")
    public ResponseEntity<List<WorkflowStep>> createWorkflowSteps(@PathVariable Long initiativeId) {
        try {
            List<WorkflowStep> steps = workflowService.createWorkflowStepsForInitiative(initiativeId);
            return ResponseEntity.ok(steps);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Helper method to get current user
    private String getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return "system"; // fallback
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkflowStep> updateWorkflowStep(
            @PathVariable Long id, 
            @RequestBody WorkflowStep workflowStep) {
        
        Optional<WorkflowStep> existingStep = workflowService.findById(id);
        if (existingStep.isPresent()) {
            workflowStep.setId(id);
            WorkflowStep updated = workflowService.save(workflowStep);
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}