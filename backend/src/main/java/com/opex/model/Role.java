package com.opex.model;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Entity
@Table(name = "roles", 
       uniqueConstraints = { 
           @UniqueConstraint(columnNames = {"code", "siteCode"}) 
       })
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 10)
    private String code; // STLD, SH, EH, IL, CTSD

    @NotBlank
    @Size(max = 100)
    private String name; // Site TSD Lead, Site Head, etc.

    @NotBlank
    @Size(max = 255)
    private String description;

    @NotBlank
    @Size(max = 10)
    private String siteCode; // NDS, HSD1, etc.

    @Size(max = 100)
    private String siteName;

    private Boolean active = true;

    public Role() {
    }

    public Role(String code, String name, String description, String siteCode, String siteName) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.siteCode = siteCode;
        this.siteName = siteName;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSiteCode() { return siteCode; }
    public void setSiteCode(String siteCode) { this.siteCode = siteCode; }

    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}