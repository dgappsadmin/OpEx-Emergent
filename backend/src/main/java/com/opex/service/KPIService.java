package com.opex.service;

import com.opex.model.KPI;
import com.opex.repository.KPIRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class KPIService {

    @Autowired
    private KPIRepository kpiRepository;

    public List<KPI> findAll() {
        return kpiRepository.findAll();
    }

    public Optional<KPI> findById(Long id) {
        return kpiRepository.findById(id);
    }

    public List<KPI> findBySite(String site) {
        return kpiRepository.findBySite(site);
    }

    public List<KPI> findByMonthAndSite(String month, String site) {
        return kpiRepository.findByMonthAndSite(month, site);
    }

    public KPI save(KPI kpi) {
        kpi.setUpdatedAt(LocalDateTime.now());
        return kpiRepository.save(kpi);
    }

    public void delete(Long id) {
        kpiRepository.deleteById(id);
    }

    public Double getTotalActualValue() {
        Double total = kpiRepository.getTotalActualValue();
        return total != null ? total : 0.0;
    }

    public Double getAverageActualValue() {
        Double avg = kpiRepository.getAverageActualValue();
        return avg != null ? avg : 0.0;
    }
}