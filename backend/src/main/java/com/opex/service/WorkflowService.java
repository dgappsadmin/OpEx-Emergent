package com.opex.service;

import com.opex.model.WorkflowStep;
import com.opex.repository.WorkflowStepRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WorkflowService {

    @Autowired
    private WorkflowStepRepository workflowStepRepository;

    public List<WorkflowStep> findByInitiativeId(Long initiativeId) {
        return workflowStepRepository.findByInitiative_IdOrderByCreatedAtAsc(initiativeId);
    }

    public List<WorkflowStep> findByStatus(String status) {
        return workflowStepRepository.findByStatus(status);
    }

    public Optional<WorkflowStep> findById(Long id) {
        return workflowStepRepository.findById(id);
    }

    public WorkflowStep save(WorkflowStep workflowStep) {
        workflowStep.setUpdatedAt(LocalDateTime.now());
        return workflowStepRepository.save(workflowStep);
    }

    public WorkflowStep approveStep(Long stepId, String comments, String signature) {
        Optional<WorkflowStep> stepOpt = workflowStepRepository.findById(stepId);
        if (stepOpt.isPresent()) {
            WorkflowStep step = stepOpt.get();
            step.setStatus("completed");
            step.setApprovalDate(LocalDateTime.now());
            step.setComments(comments);
            step.setUpdatedAt(LocalDateTime.now());
            
            // Move to next step logic
            List<WorkflowStep> allSteps = findByInitiativeId(step.getInitiative().getId());
            WorkflowStep nextStep = null;
            
            for (int i = 0; i < allSteps.size(); i++) {
                if (allSteps.get(i).getId().equals(stepId) && i + 1 < allSteps.size()) {
                    nextStep = allSteps.get(i + 1);
                    break;
                }
            }
            
            // Handle special logic for MOC and CAPEX steps
            if (step.getStepNumber() != null) {
                if (step.getStepNumber() == 4 && step.getMocRequired() != null && !step.getMocRequired()) {
                    // MOC not required, skip to CAPEX step (step 5)
                    if (nextStep != null) {
                        nextStep.setStatus("pending");
                        workflowStepRepository.save(nextStep);
                    }
                } else if (step.getStepNumber() == 5 && step.getCapexRequired() != null && !step.getCapexRequired()) {
                    // CAPEX not required, initiative can proceed to completion
                    // For now, just mark as completed - you can add more steps later
                    step.getInitiative().setStatus("COMPLETED");
                } else if (nextStep != null) {
                    // Normal flow - activate next step
                    nextStep.setStatus("pending");
                    workflowStepRepository.save(nextStep);
                }
            } else if (nextStep != null) {
                // Normal flow for other steps
                nextStep.setStatus("pending");
                workflowStepRepository.save(nextStep);
            }
            
            return workflowStepRepository.save(step);
        }
        return null;
    }

    public WorkflowStep rejectStep(Long stepId, String comments) {
        Optional<WorkflowStep> stepOpt = workflowStepRepository.findById(stepId);
        if (stepOpt.isPresent()) {
            WorkflowStep step = stepOpt.get();
            step.setStatus("rejected");
            step.setApprovalDate(LocalDateTime.now());
            step.setComments(comments);
            step.setUpdatedAt(LocalDateTime.now());
            return workflowStepRepository.save(step);
        }
        return null;
    }
}