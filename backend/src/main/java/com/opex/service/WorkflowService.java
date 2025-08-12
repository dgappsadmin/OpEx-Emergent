package com.opex.service;

import com.opex.model.WorkflowStep;
import com.opex.model.WorkflowTransaction;
import com.opex.model.Initiative;
import com.opex.model.Stage;
import com.opex.repository.WorkflowStepRepository;
import com.opex.repository.WorkflowTransactionRepository;
import com.opex.repository.InitiativeRepository;
import com.opex.service.StageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@Service
public class WorkflowService {

    @Autowired
    private WorkflowStepRepository workflowStepRepository;
    
    @Autowired
    private WorkflowTransactionRepository workflowTransactionRepository;
    
    @Autowired
    private InitiativeRepository initiativeRepository;
    
    @Autowired
    private StageService stageService;

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

    @Transactional
    public WorkflowStep approveStep(Long stepId, String comments, String signature) {
        return approveStep(stepId, comments, signature, null);
    }
    
    @Transactional
    public WorkflowStep approveStep(Long stepId, String comments, String signature, Map<String, Object> additionalData) {
        Optional<WorkflowStep> stepOpt = workflowStepRepository.findById(stepId);
        if (stepOpt.isPresent()) {
            WorkflowStep step = stepOpt.get();
            Initiative initiative = step.getInitiative();
            
            // Update step status
            step.setStatus("completed");
            step.setApprovalDate(LocalDateTime.now());
            step.setComments(comments);
            step.setUpdatedAt(LocalDateTime.now());
            
            // Handle additional data (MOC, CAPEX, Initiative Lead)
            if (additionalData != null) {
                if (additionalData.containsKey("mocRequired")) {
                    step.setMocRequired((Boolean) additionalData.get("mocRequired"));
                }
                if (additionalData.containsKey("mocNumber")) {
                    step.setMocNumber((String) additionalData.get("mocNumber"));
                }
                if (additionalData.containsKey("capexRequired")) {
                    step.setCapexRequired((Boolean) additionalData.get("capexRequired"));
                }
                if (additionalData.containsKey("capexDetails")) {
                    step.setCapexDetails((String) additionalData.get("capexDetails"));
                }
            }
            
            // Log transaction
            logWorkflowTransaction(
                initiative.getInitiativeId(),
                step.getStepNumber(),
                step.getStageName(),
                "APPROVED",
                comments,
                signature != null ? signature : "system", // action_by
                LocalDateTime.now(),
                additionalData
            );
            
            // Move to next step logic
            List<WorkflowStep> allSteps = findByInitiativeId(step.getInitiative().getId());
            WorkflowStep nextStep = null;
            
            for (int i = 0; i < allSteps.size(); i++) {
                if (allSteps.get(i).getId().equals(stepId) && i + 1 < allSteps.size()) {
                    nextStep = allSteps.get(i + 1);
                    break;
                }
            }
            
            // Handle workflow progression
            String nextPendingWith = null;
            
            if (step.getStepNumber() != null) {
                if (step.getStepNumber() == 5) {
                    // Final step completed
                    initiative.setStatus("COMPLETED");
                    initiativeRepository.save(initiative);
                } else if (nextStep != null) {
                    // Activate next step
                    nextStep.setStatus("pending");
                    nextPendingWith = getNextApprover(nextStep, initiative);
                    workflowStepRepository.save(nextStep);
                    
                    // Log next step as pending
                    logWorkflowTransaction(
                        initiative.getInitiativeId(),
                        nextStep.getStepNumber(),
                        nextStep.getStageName(),
                        "PENDING",
                        "Workflow step activated",
                        "system",
                        LocalDateTime.now(),
                        null,
                        nextPendingWith
                    );
                }
            }
            
            return workflowStepRepository.save(step);
        }
        return null;
    }

    @Transactional
    public WorkflowStep rejectStep(Long stepId, String comments) {
        Optional<WorkflowStep> stepOpt = workflowStepRepository.findById(stepId);
        if (stepOpt.isPresent()) {
            WorkflowStep step = stepOpt.get();
            Initiative initiative = step.getInitiative();
            
            step.setStatus("rejected");
            step.setApprovalDate(LocalDateTime.now());
            step.setComments(comments);
            step.setUpdatedAt(LocalDateTime.now());
            
            // Update initiative status to rejected
            initiative.setStatus("REJECTED");
            initiativeRepository.save(initiative);
            
            // Log rejection transaction
            logWorkflowTransaction(
                initiative.getInitiativeId(),
                step.getStepNumber(),
                step.getStageName(),
                "REJECTED",
                comments,
                "system", // This should be updated with actual user
                LocalDateTime.now(),
                null
            );
            
            return workflowStepRepository.save(step);
        }
        return null;
    }
    
    // Helper method to log workflow transactions
    private void logWorkflowTransaction(String workflowId, Integer stageNumber, String stageName, 
                                      String status, String comment, String actionBy, 
                                      LocalDateTime actionDate, Map<String, Object> additionalData) {
        logWorkflowTransaction(workflowId, stageNumber, stageName, status, comment, actionBy, actionDate, additionalData, null);
    }
    
    private void logWorkflowTransaction(String workflowId, Integer stageNumber, String stageName, 
                                      String status, String comment, String actionBy, 
                                      LocalDateTime actionDate, Map<String, Object> additionalData, String pendingWith) {
        WorkflowTransaction transaction = new WorkflowTransaction();
        transaction.setWorkflowId(workflowId);
        transaction.setStageNumber(stageNumber);
        transaction.setStageName(stageName);
        transaction.setStatus(status);
        transaction.setComment(comment);
        transaction.setActionBy(actionBy);
        transaction.setActionDate(actionDate);
        transaction.setPendingWith(pendingWith);
        
        // Set additional data if provided
        if (additionalData != null) {
            if (additionalData.containsKey("mocRequired")) {
                transaction.setMocRequired((Boolean) additionalData.get("mocRequired"));
            }
            if (additionalData.containsKey("mocNumber")) {
                transaction.setMocNumber((String) additionalData.get("mocNumber"));
            }
            if (additionalData.containsKey("capexRequired")) {
                transaction.setCapexRequired((Boolean) additionalData.get("capexRequired"));
            }
            if (additionalData.containsKey("capexDetails")) {
                transaction.setCapexDetails((String) additionalData.get("capexDetails"));
            }
            if (additionalData.containsKey("initiativeLead")) {
                transaction.setInitiativeLead((String) additionalData.get("initiativeLead"));
            }
        }
        
        workflowTransactionRepository.save(transaction);
    }
    
    // Helper method to get next approver
    private String getNextApprover(WorkflowStep step, Initiative initiative) {
        if (step.getStage() != null) {
            String roleCode = step.getStage().getRoleCode();
            String siteCode = initiative.getSite().getCode().toLowerCase();
            
            switch (roleCode) {
                case "STLD":
                    return siteCode + "_stld@godeepak.com";
                case "SH":
                    return siteCode + "_sh@godeepak.com";
                case "EH":
                    return siteCode + "_eh@godeepak.com";
                case "IL":
                    return siteCode + "_il@godeepak.com";
                case "CTSD":
                    return "corp_ctsd@godeepak.com";
                default:
                    return siteCode + "_stld@godeepak.com";
            }
        }
        return null;
    }
    
    // New methods for transaction tracking
    public List<WorkflowTransaction> getWorkflowHistory(String workflowId) {
        return workflowTransactionRepository.findWorkflowHistory(workflowId);
    }
    
    public List<WorkflowTransaction> getPendingTransactions(String userEmail) {
        return workflowTransactionRepository.findPendingTransactionsByUser(userEmail);
    }
    
    // Method to create workflow steps for existing initiatives
    @Transactional
    public List<WorkflowStep> createWorkflowStepsForInitiative(Long initiativeId) throws Exception {
        Optional<Initiative> initiativeOpt = initiativeRepository.findById(initiativeId);
        if (!initiativeOpt.isPresent()) {
            throw new Exception("Initiative not found");
        }
        
        Initiative initiative = initiativeOpt.get();
        
        // Get the first 5 stages (as per requirement for 5-step process)
        List<Stage> stages = stageService.findAllActiveOrdered();
        if (stages.size() > 5) {
            stages = stages.subList(0, 5);
        }
        
        for (int i = 0; i < stages.size(); i++) {
            Stage stage = stages.get(i);
            WorkflowStep step = new WorkflowStep();
            step.setInitiative(initiative);
            step.setStage(stage);
            step.setStepNumber(i + 1);
            step.setApprover(getApproverForStage(stage, initiative));
            step.setStatus(i == 0 ? "pending" : "waiting");
            workflowStepRepository.save(step);
            
            // Log initial transaction for first step
            if (i == 0) {
                logWorkflowTransaction(
                    initiative.getInitiativeId(),
                    1,
                    stage.getActivity(),
                    "PENDING",
                    "Workflow initialized",
                    "system",
                    LocalDateTime.now(),
                    null,
                    getApproverForStage(stage, initiative)
                );
            }
        }
        
        return findByInitiativeId(initiativeId);
    }
    
    // Helper method to get approver for stage (copied from InitiativeService)
    private String getApproverForStage(Stage stage, Initiative initiative) {
        String siteCode = initiative.getSite().getCode().toLowerCase();
        String roleCode = stage.getRoleCode();
        
        switch (roleCode) {
            case "STLD":
                return siteCode + "_stld@godeepak.com";
            case "SH":
                return siteCode + "_sh@godeepak.com";
            case "EH":
                return siteCode + "_eh@godeepak.com";
            case "IL":
                return siteCode + "_il@godeepak.com";
            case "CTSD":
                return "corp_ctsd@godeepak.com";
            default:
                return siteCode + "_stld@godeepak.com";
        }
    }
}