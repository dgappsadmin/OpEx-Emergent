package com.opex.controller;

import com.opex.service.InitiativeService;
import com.opex.service.KPIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

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
        
        try {
            // Initiative statistics
            long totalInitiatives = initiativeService.findAll().size();
            long proposedInitiatives = initiativeService.countByStatus("PROPOSED");
            long approvedInitiatives = initiativeService.countByStatus("APPROVED");
            long inProgressInitiatives = initiativeService.countByStatus("IN_PROGRESS");
            long completedInitiatives = initiativeService.countByStatus("COMPLETED");
            long rejectedInitiatives = initiativeService.countByStatus("REJECTED");
            
            // Financial statistics - Fixed method name
            double totalSavings = initiativeService.getTotalEstimatedSavings();
            
            stats.put("totalInitiatives", totalInitiatives);
            stats.put("proposedInitiatives", proposedInitiatives);
            stats.put("approvedInitiatives", approvedInitiatives);
            stats.put("inProgressInitiatives", inProgressInitiatives);
            stats.put("completedInitiatives", completedInitiatives);
            stats.put("rejectedInitiatives", rejectedInitiatives);
            stats.put("totalSavings", totalSavings);
            stats.put("pendingApprovals", proposedInitiatives + inProgressInitiatives);
            
            // Calculate completion rate
            double completionRate = totalInitiatives > 0 ? 
                (double) completedInitiatives / totalInitiatives * 100 : 0;
            stats.put("completionRate", Math.round(completionRate * 100.0) / 100.0);
            
        } catch (Exception e) {
            // Return default stats if error occurs
            stats.put("totalInitiatives", 0);
            stats.put("proposedInitiatives", 0);
            stats.put("approvedInitiatives", 0);
            stats.put("inProgressInitiatives", 0);
            stats.put("completedInitiatives", 0);
            stats.put("rejectedInitiatives", 0);
            stats.put("totalSavings", 0.0);
            stats.put("pendingApprovals", 0);
            stats.put("completionRate", 0.0);
        }
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivities() {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        try {
            // This would typically fetch from audit logs or activity tracking
            // For now, return empty list or sample activities
            Map<String, Object> activity1 = new HashMap<>();
            activity1.put("id", 1);
            activity1.put("action", "System initialized");
            activity1.put("user", "System");
            activity1.put("time", "Just now");
            activity1.put("type", "system");
            activities.add(activity1);
            
        } catch (Exception e) {
            // Return empty activities if error occurs
        }
        
        return ResponseEntity.ok(activities);
    }
}