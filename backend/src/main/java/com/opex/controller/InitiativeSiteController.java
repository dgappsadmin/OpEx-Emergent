package com.opex.controller;

import com.opex.model.InitiativeSite;
import com.opex.service.InitiativeSiteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/initiative-sites")
public class InitiativeSiteController {

    @Autowired
    private InitiativeSiteService service;

    @GetMapping
    public List<InitiativeSite> getAllSites() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InitiativeSite> getSiteById(@PathVariable Long id) {
        Optional<InitiativeSite> site = service.findById(id);
        return site.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<InitiativeSite> getSiteByCode(@PathVariable String code) {
        Optional<InitiativeSite> site = service.findByCode(code);
        return site.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}