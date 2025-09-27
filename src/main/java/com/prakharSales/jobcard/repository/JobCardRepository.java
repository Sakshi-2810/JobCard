package com.prakharSales.jobcard.repository;

import com.prakharSales.jobcard.model.JobCard;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface JobCardRepository extends MongoRepository<JobCard, Integer> {
    @Query("SELECT MAX(j.id) FROM JobCard j")
    Integer findMaxJobCardId();
}