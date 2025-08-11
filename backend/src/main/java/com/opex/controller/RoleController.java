package com.opex.controller;

import com.opex.model.Role;
import com.opex.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = roleService.findAllActive();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/site/{siteCode}")
    public ResponseEntity<List<Role>> getRolesBySite(@PathVariable String siteCode) {
        List<Role> roles = roleService.findBySite(siteCode);
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<List<Role>> getRolesByCode(@PathVariable String code) {
        List<Role> roles = roleService.findByCode(code);
        return ResponseEntity.ok(roles);
    }
}