package com.opex.repository;

import com.opex.model.KPI;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KPIRepository extends JpaRepository<KPI, Long> {
    List<KPI> findBySite(String site);
    List<KPI> findByMonthAndSite(String month, String site);
    
    @Query("SELECT SUM(k.actualValue) FROM KPI k")
    Double getTotalActualValue();
    
    @Query("SELECT AVG(k.actualValue) FROM KPI k")
    Double getAverageActualValue();
}