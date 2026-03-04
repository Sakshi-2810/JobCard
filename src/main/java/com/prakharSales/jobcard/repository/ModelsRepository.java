package com.prakharSales.jobcard.repository;

import com.prakharSales.jobcard.model.Models;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface ModelsRepository extends MongoRepository<Models, Integer> {
    Models findTopByOrderByModelIdDesc();

    Models findByModelName(String modelName);

    boolean existsByModelName(String modelName);

    void deleteByModelName(String modelName);

    List<Models> findByModelNameIn(Set<String> strings);
}
