package com.opex.controller;

import com.opex.model.Stage;
import com.opex.service.StageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/stages")
public class StageController {

    @Autowired
    private StageService stageService;

    @GetMapping
    public ResponseEntity<List<Stage>> getAllStages() {
        List<Stage> stages = stageService.findAllActiveOrdered();
        return ResponseEntity.ok(stages);
    }

    @GetMapping("/role/{roleCode}")
    public ResponseEntity<List<Stage>> getStagesByRole(@PathVariable String roleCode) {
        List<Stage> stages = stageService.findByRoleCode(roleCode);
        return ResponseEntity.ok(stages);
    }

    @GetMapping("/{stepNumber}")
    public ResponseEntity<Stage> getStageByNumber(@PathVariable Integer stepNumber) {
        return stageService.findByStepNumber(stepNumber)
                .map(stage -> ResponseEntity.ok().body(stage))
                .orElse(ResponseEntity.notFound().build());
    }
}