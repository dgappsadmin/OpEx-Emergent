package com.opex.service;

import com.opex.model.InitiativeDiscipline;
import com.opex.repository.InitiativeDisciplineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InitiativeDisciplineService {

    @Autowired
    private InitiativeDisciplineRepository repository;

    public List<InitiativeDiscipline> findAll() {
        return repository.findAll();
    }

    public Optional<InitiativeDiscipline> findById(Long id) {
        return repository.findById(id);
    }

    public Optional<InitiativeDiscipline> findByCode(String code) {
        return repository.findByCode(code);
    }

    public InitiativeDiscipline save(InitiativeDiscipline discipline) {
        return repository.save(discipline);
    }
}