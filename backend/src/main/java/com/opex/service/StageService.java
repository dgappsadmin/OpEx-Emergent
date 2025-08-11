package com.opex.service;

import com.opex.model.Stage;
import com.opex.repository.StageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class StageService {

    @Autowired
    private StageRepository stageRepository;

    public List<Stage> findAll() {
        return stageRepository.findAll();
    }

    public List<Stage> findAllActiveOrdered() {
        return stageRepository.findByActiveTrueOrderByStepNumber();
    }

    public Optional<Stage> findByStepNumber(Integer stepNumber) {
        return stageRepository.findByStepNumberAndActiveTrue(stepNumber);
    }

    public List<Stage> findByRoleCode(String roleCode) {
        return stageRepository.findByRoleCodeAndActiveTrue(roleCode);
    }

    public Optional<Stage> findById(Long id) {
        return stageRepository.findById(id);
    }

    public Stage save(Stage stage) {
        return stageRepository.save(stage);
    }

    public void deleteById(Long id) {
        stageRepository.deleteById(id);
    }
}