package com.prakharSales.jobcard.repository;

import com.prakharSales.jobcard.model.LabourCharge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LabourChargeRepository extends MongoRepository<LabourCharge, String> {
}
