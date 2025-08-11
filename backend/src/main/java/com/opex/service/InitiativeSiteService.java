package com.opex.service;

import com.opex.model.InitiativeSite;
import com.opex.repository.InitiativeSiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InitiativeSiteService {

    @Autowired
    private InitiativeSiteRepository repository;

    public List<InitiativeSite> findAll() {
        return repository.findAll();
    }

    public Optional<InitiativeSite> findById(Long id) {
        return repository.findById(id);
    }

    public Optional<InitiativeSite> findByCode(String code) {
        return repository.findByCode(code);
    }

    public InitiativeSite save(InitiativeSite site) {
        return repository.save(site);
    }
}