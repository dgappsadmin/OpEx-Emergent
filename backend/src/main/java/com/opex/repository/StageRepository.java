package com.opex.repository;

import com.opex.model.Stage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StageRepository extends JpaRepository<Stage, Long> {
    List<Stage> findByActiveTrueOrderByStepNumber();
    Optional<Stage> findByStepNumberAndActiveTrue(Integer stepNumber);
    List<Stage> findByRoleCodeAndActiveTrue(String roleCode);
}