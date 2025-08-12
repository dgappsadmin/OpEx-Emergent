package com.opex.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_transaction")
public class WorkflowTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workflow_id")
    private String workflowId;

    @Column(name = "stage_number")
    private Integer stageNumber;

    @Column(name = "stage_name")
    private String stageName;

    @Column(name = "status", length = 50)
    private String status; // APPROVED, REJECTED, PENDING

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "action_by")
    private String actionBy;

    @Column(name = "action_date")
    private LocalDateTime actionDate;

    @Column(name = "pending_with")
    private String pendingWith;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Additional fields for MOC and CAPEX tracking
    @Column(name = "moc_required")
    private Boolean mocRequired;

    @Column(name = "moc_number")
    private String mocNumber;

    @Column(name = "capex_required")
    private Boolean capexRequired;

    @Column(name = "capex_details", columnDefinition = "TEXT")
    private String capexDetails;

    @Column(name = "initiative_lead")
    private String initiativeLead;

    public WorkflowTransaction() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getWorkflowId() { return workflowId; }
    public void setWorkflowId(String workflowId) { this.workflowId = workflowId; }

    public Integer getStageNumber() { return stageNumber; }
    public void setStageNumber(Integer stageNumber) { this.stageNumber = stageNumber; }

    public String getStageName() { return stageName; }
    public void setStageName(String stageName) { this.stageName = stageName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getActionBy() { return actionBy; }
    public void setActionBy(String actionBy) { this.actionBy = actionBy; }

    public LocalDateTime getActionDate() { return actionDate; }
    public void setActionDate(LocalDateTime actionDate) { this.actionDate = actionDate; }

    public String getPendingWith() { return pendingWith; }
    public void setPendingWith(String pendingWith) { this.pendingWith = pendingWith; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Boolean getMocRequired() { return mocRequired; }
    public void setMocRequired(Boolean mocRequired) { this.mocRequired = mocRequired; }

    public String getMocNumber() { return mocNumber; }
    public void setMocNumber(String mocNumber) { this.mocNumber = mocNumber; }

    public Boolean getCapexRequired() { return capexRequired; }
    public void setCapexRequired(Boolean capexRequired) { this.capexRequired = capexRequired; }

    public String getCapexDetails() { return capexDetails; }
    public void setCapexDetails(String capexDetails) { this.capexDetails = capexDetails; }

    public String getInitiativeLead() { return initiativeLead; }
    public void setInitiativeLead(String initiativeLead) { this.initiativeLead = initiativeLead; }
}