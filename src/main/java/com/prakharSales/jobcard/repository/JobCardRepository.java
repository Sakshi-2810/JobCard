package com.prakharSales.jobcard.repository;

import com.prakharSales.jobcard.model.JobCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface JobCardRepository extends JpaRepository<JobCard, Integer> {
    @Query("SELECT MAX(j.id) FROM JobCard j")
    Integer findMaxJobCardId();
}