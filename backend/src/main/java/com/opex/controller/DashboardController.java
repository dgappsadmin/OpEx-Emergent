package com.opex.controller;

import com.opex.service.InitiativeService;
import com.opex.service.KPIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private InitiativeService initiativeService;

    @Autowired
    private KPIService kpiService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Initiative statistics
        Long totalInitiatives = (long) initiativeService.findAll().size();
        Long approvedInitiatives = initiativeService.countByStatus("APPROVED");
        Long pendingInitiatives = initiativeService.countByStatus("PROPOSED");
        Long inProgressInitiatives = initiativeService.countByStatus("IN_PROGRESS");
        
        // Financial statistics
        Double totalSavings = kpiService.getTotalActualValue();
        Double expectedValue = initiativeService.getTotalExpectedValue();

        // Calculate completion rate
        double completionRate = totalInitiatives > 0 ? 
            (approvedInitiatives.doubleValue() / totalInitiatives.doubleValue()) * 100 : 0;
        
        stats.put("totalInitiatives", totalInitiatives);
        stats.put("approvedInitiatives", approvedInitiatives);
        stats.put("pendingInitiatives", pendingInitiatives);
        stats.put("inProgressInitiatives", inProgressInitiatives);
        stats.put("totalSavings", totalSavings != null ? totalSavings : 0.0);
        stats.put("expectedValue", expectedValue != null ? expectedValue : 0.0);
        stats.put("completionRate", Math.round(completionRate));
        stats.put("targetSavings", 3000000.0); // Target for the year
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<Map<String, Object>> getRecentActivities() {
        Map<String, Object> response = new HashMap<>();
        
        // This could be enhanced to track actual activities
        // For now, returning sample data structure
        response.put("activities", new java.util.ArrayList<>());
        
        return ResponseEntity.ok(response);
    }
}