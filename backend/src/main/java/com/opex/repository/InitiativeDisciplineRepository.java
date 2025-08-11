package com.opex.repository;

import com.opex.model.InitiativeDiscipline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InitiativeDisciplineRepository extends JpaRepository<InitiativeDiscipline, Long> {
    Optional<InitiativeDiscipline> findByCode(String code);
}