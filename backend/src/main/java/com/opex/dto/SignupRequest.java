package com.opex.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class SignupRequest {
    
    private String username; // Optional, will be generated from email if not provided

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(max = 50)
    private String firstName;

    @NotBlank
    @Size(max = 50)
    private String lastName;

    @NotNull
    private Long siteId; // Site ID from frontend

    @NotBlank
    @Size(max = 10)
    private String roleCode; // Role code from frontend (STLD, SH, EH, IL, CTSD)

    @NotBlank
    @Size(max = 120)
    private String password;

    // No confirmPassword needed as validation is done on frontend

    public SignupRequest() {
    }

    // Getters and setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public Long getSiteId() { return siteId; }
    public void setSiteId(Long siteId) { this.siteId = siteId; }

    public String getRoleCode() { return roleCode; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}