package com.opex.repository;

import com.opex.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    List<Role> findByActiveTrue();
    List<Role> findBySiteCodeAndActiveTrue(String siteCode);
    Optional<Role> findByCodeAndSiteCode(String code, String siteCode);
    List<Role> findByCode(String code);
}