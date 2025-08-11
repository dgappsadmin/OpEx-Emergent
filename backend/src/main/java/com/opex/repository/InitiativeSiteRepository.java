package com.opex.repository;

import com.opex.model.InitiativeSite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InitiativeSiteRepository extends JpaRepository<InitiativeSite, Long> {
    Optional<InitiativeSite> findByCode(String code);
}