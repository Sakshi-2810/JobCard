package com.prakharSales.jobcard.repository;

import com.prakharSales.jobcard.model.PartBill;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartBillRepository extends MongoRepository<PartBill, String> {
}
