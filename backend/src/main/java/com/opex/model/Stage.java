package com.opex.model;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Entity
@Table(name = "stages")
public class Stage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private Integer stepNumber;

    @NotBlank
    @Size(max = 100)
    private String activity;

    @NotBlank
    @Size(max = 100)
    private String responsibility;

    @NotBlank
    @Size(max = 10)
    private String roleCode; // STLD, SH, EH, IL, CTSD

    @Size(max = 10)
    private String annexure; // Annexure 2, Annexure 3, etc.

    @Size(max = 255)
    private String description;

    private Boolean requiresMoc = false;
    private Boolean requiresCapex = false;
    private Boolean active = true;

    public Stage() {
    }

    public Stage(Integer stepNumber, String activity, String responsibility, String roleCode, String annexure, String description) {
        this.stepNumber = stepNumber;
        this.activity = activity;
        this.responsibility = responsibility;
        this.roleCode = roleCode;
        this.annexure = annexure;
        this.description = description;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getStepNumber() { return stepNumber; }
    public void setStepNumber(Integer stepNumber) { this.stepNumber = stepNumber; }

    public String getActivity() { return activity; }
    public void setActivity(String activity) { this.activity = activity; }

    public String getResponsibility() { return responsibility; }
    public void setResponsibility(String responsibility) { this.responsibility = responsibility; }

    public String getRoleCode() { return roleCode; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }

    public String getAnnexure() { return annexure; }
    public void setAnnexure(String annexure) { this.annexure = annexure; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getRequiresMoc() { return requiresMoc; }
    public void setRequiresMoc(Boolean requiresMoc) { this.requiresMoc = requiresMoc; }

    public Boolean getRequiresCapex() { return requiresCapex; }
    public void setRequiresCapex(Boolean requiresCapex) { this.requiresCapex = requiresCapex; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}