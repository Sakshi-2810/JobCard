package com.prakharSales.jobcard.repository;

import com.prakharSales.jobcard.model.LabourCharge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LabourChargeRepository extends JpaRepository<LabourCharge, String> {
}
