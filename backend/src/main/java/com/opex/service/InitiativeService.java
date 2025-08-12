package com.opex.service;

import com.opex.model.Initiative;
import com.opex.model.InitiativeSite;
import com.opex.model.InitiativeDiscipline;
import com.opex.model.WorkflowStep;
import com.opex.model.WorkflowTransaction;
import com.opex.model.Stage;
import com.opex.repository.InitiativeRepository;
import com.opex.repository.InitiativeSiteRepository;
import com.opex.repository.InitiativeDisciplineRepository;
import com.opex.repository.WorkflowStepRepository;
import com.opex.repository.WorkflowTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Collections;

@Service
public class InitiativeService {

    @Autowired
    private InitiativeRepository initiativeRepository;
    
    @Autowired
    private InitiativeSiteRepository initiativeSiteRepository;
    
    @Autowired
    private InitiativeDisciplineRepository initiativeDisciplineRepository;
    
    @Autowired
    private WorkflowStepRepository workflowStepRepository;
    
    @Autowired
    private WorkflowTransactionRepository workflowTransactionRepository;
    
    @Autowired
    private StageService stageService;

    public List<Initiative> findAll() {
        return initiativeRepository.findAll();
    }

    public Optional<Initiative> findById(Long id) {
        return initiativeRepository.findById(id);
    }

    public Optional<Initiative> findByInitiativeId(String initiativeId) {
        return initiativeRepository.findByInitiativeId(initiativeId);
    }

    public List<Initiative> findByStatus(String status) {
        return initiativeRepository.findByStatus(status);
    }

    public List<Initiative> findBySite(String siteCode) {
        Optional<InitiativeSite> site = initiativeSiteRepository.findByCode(siteCode);
        if (site.isPresent()) {
            return initiativeRepository.findBySite(site.get());
        }
        return Collections.emptyList(); // Fixed: Use Collections.emptyList() instead of List.of()
    }

    public long countByStatus(String status) {
        return initiativeRepository.countByStatus(status);
    }

    @Transactional
    public Initiative save(Initiative initiative) {
        boolean isNewInitiative = initiative.getId() == null;
        
        // Generate initiative ID if new
        if (isNewInitiative && (initiative.getInitiativeId() == null || initiative.getInitiativeId().isEmpty())) {
            String initiativeId = generateInitiativeId(initiative.getSite());
            initiative.setInitiativeId(initiativeId);
        }

        // Save the initiative
        Initiative savedInitiative = initiativeRepository.save(initiative);
        
        // AUTOMATICALLY CREATE WORKFLOW STEPS FOR NEW INITIATIVES
        if (isNewInitiative) {
            createWorkflowStepsForInitiative(savedInitiative);
        }
        
        return savedInitiative;
    }

    @Transactional
    private void createWorkflowStepsForInitiative(Initiative initiative) {
        // Get all 5 stages in order
        List<Stage> stages = stageService.findAllActiveOrdered();
        if (stages.size() >= 5) {
            stages = stages.subList(0, 5); // Take first 5 stages
        }
        
        for (int i = 0; i < stages.size(); i++) {
            Stage stage = stages.get(i);
            
            // Create workflow step
            WorkflowStep step = new WorkflowStep();
            step.setInitiative(initiative);
            step.setStage(stage);
            step.setStepNumber(i + 1);
            step.setApprover(getApproverForStage(stage, initiative));
            step.setStatus(i == 0 ? "pending" : "waiting"); // First step is pending, others waiting
            workflowStepRepository.save(step);
            
            // Create initial workflow transaction for first step
            if (i == 0) {
                WorkflowTransaction transaction = new WorkflowTransaction();
                transaction.setWorkflowId(initiative.getInitiativeId());
                transaction.setInitiative(initiative);
                transaction.setSite(initiative.getSite().getCode());
                transaction.setStageNumber(1);
                transaction.setStageName(stage.getActivity());
                transaction.setStatus("PENDING");
                transaction.setComment("Workflow initialized - awaiting " + stage.getResponsibility() + " action");
                transaction.setActionBy("system");
                transaction.setActionDate(LocalDateTime.now());
                transaction.setPendingWith(getApproverForStage(stage, initiative));
                workflowTransactionRepository.save(transaction);
            }
        }
    }
    
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

    private String generateInitiativeId(InitiativeSite site) {
        String siteCode = site.getCode();
        long count = initiativeRepository.count() + 1;
        return siteCode + "-INI-" + String.format("%04d", count);
    }

    public void deleteById(Long id) {
        initiativeRepository.deleteById(id);
    }

    public double getTotalEstimatedSavings() {
        Double total = initiativeRepository.sumEstimatedSavings();
        return total != null ? total : 0.0;
    }
}