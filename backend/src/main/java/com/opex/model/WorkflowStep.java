package com.opex.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_steps")
public class WorkflowStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiative_id")
    private Initiative initiative;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "stage_id")
    private Stage stage;

    private Integer stepNumber;
    private String status; // pending, completed, waiting, rejected
    private String approver;
    private LocalDateTime approvalDate;
    private String comments;

    // MOC and CAPEX specific fields
    private Boolean mocRequired = false;
    private String mocNumber;
    private Boolean capexRequired = false;
    private String capexDetails;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WorkflowStep() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Initiative getInitiative() { return initiative; }
    public void setInitiative(Initiative initiative) { this.initiative = initiative; }

    public Stage getStage() { return stage; }
    public void setStage(Stage stage) { this.stage = stage; }

    public Integer getStepNumber() { return stepNumber; }
    public void setStepNumber(Integer stepNumber) { this.stepNumber = stepNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getApprover() { return approver; }
    public void setApprover(String approver) { this.approver = approver; }

    public LocalDateTime getApprovalDate() { return approvalDate; }
    public void setApprovalDate(LocalDateTime approvalDate) { this.approvalDate = approvalDate; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public Boolean getMocRequired() { return mocRequired; }
    public void setMocRequired(Boolean mocRequired) { this.mocRequired = mocRequired; }

    public String getMocNumber() { return mocNumber; }
    public void setMocNumber(String mocNumber) { this.mocNumber = mocNumber; }

    public Boolean getCapexRequired() { return capexRequired; }
    public void setCapexRequired(Boolean capexRequired) { this.capexRequired = capexRequired; }

    public String getCapexDetails() { return capexDetails; }
    public void setCapexDetails(String capexDetails) { this.capexDetails = capexDetails; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper method to get stage activity for backward compatibility
    public String getStageName() {
        return stage != null ? stage.getActivity() : null;
    }
}