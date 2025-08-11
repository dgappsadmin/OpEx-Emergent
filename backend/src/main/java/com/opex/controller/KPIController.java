package com.opex.controller;

import com.opex.model.KPI;
import com.opex.service.KPIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/kpis")
public class KPIController {

    @Autowired
    private KPIService kpiService;

    @GetMapping
    public List<KPI> getAllKPIs() {
        return kpiService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<KPI> getKPIById(@PathVariable Long id) {
        Optional<KPI> kpi = kpiService.findById(id);
        return kpi.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/site/{site}")
    public List<KPI> getKPIsBySite(@PathVariable String site) {
        return kpiService.findBySite(site);
    }

    @GetMapping("/month/{month}/site/{site}")
    public List<KPI> getKPIByMonthAndSite(
            @PathVariable String month, 
            @PathVariable String site) {
        return kpiService.findByMonthAndSite(month, site);
    }

    @PostMapping
    public ResponseEntity<KPI> createKPI(@RequestBody KPI kpi) {
        try {
            KPI savedKPI = kpiService.save(kpi);
            return ResponseEntity.ok(savedKPI);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<KPI> updateKPI(@PathVariable Long id, @RequestBody KPI kpi) {
        Optional<KPI> existingKPI = kpiService.findById(id);
        if (existingKPI.isPresent()) {
            kpi.setId(id);
            KPI updated = kpiService.save(kpi);
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteKPI(@PathVariable Long id) {
        kpiService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats/total-savings")
    public ResponseEntity<Double> getTotalSavings() {
        return ResponseEntity.ok(kpiService.getTotalActualValue());
    }

    @GetMapping("/stats/avg-productivity")
    public ResponseEntity<Double> getAvgProductivity() {
        return ResponseEntity.ok(kpiService.getAverageActualValue());
    }
}