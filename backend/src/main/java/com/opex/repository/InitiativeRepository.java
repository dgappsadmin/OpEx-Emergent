package com.opex.repository;

import com.opex.model.Initiative;
import com.opex.model.InitiativeSite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InitiativeRepository extends JpaRepository<Initiative, Long> {
    Optional<Initiative> findByInitiativeId(String initiativeId);
    List<Initiative> findByStatus(String status);
    List<Initiative> findBySite(InitiativeSite site);
    
    @Query("SELECT i FROM Initiative i WHERE i.site.code = ?1")
    List<Initiative> findBySiteCode(String siteCode);
    
    @Query("SELECT COUNT(i) FROM Initiative i WHERE i.status = ?1")
    Long countByStatus(String status);
    
    @Query("SELECT SUM(i.estimatedSavings) FROM Initiative i WHERE i.status = 'APPROVED'")
    Double getTotalExpectedValue();
    
    @Query("SELECT COALESCE(SUM(i.estimatedSavings), 0.0) FROM Initiative i")
    Double sumEstimatedSavings();
    
    @Query("SELECT COUNT(i) FROM Initiative i WHERE i.site.code = ?1 AND i.discipline.code = ?2 AND YEAR(i.proposalDate) = ?3")
    Long countBySiteCodeAndDisciplineCodeAndYear(String siteCode, String disciplineCode, int year);
 
    @Query("SELECT COUNT(i) FROM Initiative i WHERE i.site.code = ?1 AND YEAR(i.proposalDate) = ?2")
    Long countBySiteCodeAndYear(String siteCode, int year);
}