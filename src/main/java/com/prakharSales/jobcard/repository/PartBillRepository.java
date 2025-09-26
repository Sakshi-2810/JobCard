package com.prakharSales.jobcard.repository;

import com.prakharSales.jobcard.model.PartBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartBillRepository extends JpaRepository<PartBill, String> {
}
