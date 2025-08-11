package com.opex.controller;

import com.opex.model.InitiativeDiscipline;
import com.opex.service.InitiativeDisciplineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/initiative-disciplines")
public class InitiativeDisciplineController {

    @Autowired
    private InitiativeDisciplineService service;

    @GetMapping
    public List<InitiativeDiscipline> getAllDisciplines() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InitiativeDiscipline> getDisciplineById(@PathVariable Long id) {
        Optional<InitiativeDiscipline> discipline = service.findById(id);
        return discipline.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<InitiativeDiscipline> getDisciplineByCode(@PathVariable String code) {
        Optional<InitiativeDiscipline> discipline = service.findByCode(code);
        return discipline.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}