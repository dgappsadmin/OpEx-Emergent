package com.opex.model;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "initiatives")
public class Initiative {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String initiativeId;

    @NotBlank
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private InitiativeSite site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discipline_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private InitiativeDiscipline discipline;

    @NotBlank
    private String proposer;

    @NotNull
    private LocalDate proposalDate;

    @NotNull
    private LocalDate expectedClosureDate;

    private LocalDate actualClosureDate;

    @NotNull
    @Column(precision = 15, scale = 2)
    private BigDecimal estimatedSavings;

    @Column(precision = 15, scale = 2)
    private BigDecimal actualSavings;

    @NotBlank
    private String status; // PROPOSED, APPROVED, IN_PROGRESS, COMPLETED, REJECTED

    @NotBlank
    private String priority; // HIGH, MEDIUM, LOW

    @NotBlank
    private String budgetType; // BUDGETED, NON_BUDGETED

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Initiative() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInitiativeId() { return initiativeId; }
    public void setInitiativeId(String initiativeId) { this.initiativeId = initiativeId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public InitiativeSite getSite() { return site; }
    public void setSite(InitiativeSite site) { this.site = site; }

    public InitiativeDiscipline getDiscipline() { return discipline; }
    public void setDiscipline(InitiativeDiscipline discipline) { this.discipline = discipline; }

    public String getProposer() { return proposer; }
    public void setProposer(String proposer) { this.proposer = proposer; }

    public LocalDate getProposalDate() { return proposalDate; }
    public void setProposalDate(LocalDate proposalDate) { this.proposalDate = proposalDate; }

    public LocalDate getExpectedClosureDate() { return expectedClosureDate; }
    public void setExpectedClosureDate(LocalDate expectedClosureDate) { this.expectedClosureDate = expectedClosureDate; }

    public LocalDate getActualClosureDate() { return actualClosureDate; }
    public void setActualClosureDate(LocalDate actualClosureDate) { this.actualClosureDate = actualClosureDate; }

    public BigDecimal getEstimatedSavings() { return estimatedSavings; }
    public void setEstimatedSavings(BigDecimal estimatedSavings) { this.estimatedSavings = estimatedSavings; }

    public BigDecimal getActualSavings() { return actualSavings; }
    public void setActualSavings(BigDecimal actualSavings) { this.actualSavings = actualSavings; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getBudgetType() { return budgetType; }
    public void setBudgetType(String budgetType) { this.budgetType = budgetType; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}