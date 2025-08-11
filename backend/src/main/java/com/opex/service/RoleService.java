package com.opex.service;

import com.opex.model.Role;
import com.opex.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    public List<Role> findAllActive() {
        return roleRepository.findByActiveTrue();
    }

    public List<Role> findBySite(String siteCode) {
        return roleRepository.findBySiteCodeAndActiveTrue(siteCode);
    }

    public Optional<Role> findByCodeAndSite(String code, String siteCode) {
        return roleRepository.findByCodeAndSiteCode(code, siteCode);
    }

    public List<Role> findByCode(String code) {
        return roleRepository.findByCode(code);
    }

    public Optional<Role> findById(Long id) {
        return roleRepository.findById(id);
    }

    public Role save(Role role) {
        return roleRepository.save(role);
    }

    public void deleteById(Long id) {
        roleRepository.deleteById(id);
    }
}