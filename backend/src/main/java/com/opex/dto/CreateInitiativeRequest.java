package com.opex.dto;

import java.time.LocalDate;
import java.math.BigDecimal;

public class CreateInitiativeRequest {
    private String title;
    private String description;
    private String category;
    private Long siteId;
    private Long disciplineId;
    private String proposer;
    private LocalDate proposalDate;
    private LocalDate expectedClosureDate;
    private BigDecimal estimatedSavings;
    private String priority;
    private String budgetType;
    private String comments;

    // Getters and setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Long getSiteId() { return siteId; }
    public void setSiteId(Long siteId) { this.siteId = siteId; }

    public Long getDisciplineId() { return disciplineId; }
    public void setDisciplineId(Long disciplineId) { this.disciplineId = disciplineId; }

    public String getProposer() { return proposer; }
    public void setProposer(String proposer) { this.proposer = proposer; }

    public LocalDate getProposalDate() { return proposalDate; }
    public void setProposalDate(LocalDate proposalDate) { this.proposalDate = proposalDate; }

    public LocalDate getExpectedClosureDate() { return expectedClosureDate; }
    public void setExpectedClosureDate(LocalDate expectedClosureDate) { this.expectedClosureDate = expectedClosureDate; }

    public BigDecimal getEstimatedSavings() { return estimatedSavings; }
    public void setEstimatedSavings(BigDecimal estimatedSavings) { this.estimatedSavings = estimatedSavings; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getBudgetType() { return budgetType; }
    public void setBudgetType(String budgetType) { this.budgetType = budgetType; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}