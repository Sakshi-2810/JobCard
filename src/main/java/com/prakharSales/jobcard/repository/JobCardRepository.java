package com.prakharSales.jobcard.repository;

import com.prakharSales.jobcard.model.JobCard;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobCardRepository extends MongoRepository<JobCard, Integer> {
}