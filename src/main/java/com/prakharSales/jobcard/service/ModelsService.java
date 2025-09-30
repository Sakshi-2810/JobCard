package com.prakharSales.jobcard.service;

import com.prakharSales.jobcard.exception.CustomDataException;
import com.prakharSales.jobcard.model.Models;
import com.prakharSales.jobcard.model.PartsDetail;
import com.prakharSales.jobcard.model.Response;
import com.prakharSales.jobcard.repository.ModelsRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class ModelsService {
    @Autowired
    private ModelsRepository modelsRepository;

    public Integer generateNewModelId() {
        Integer maxId = Optional.ofNullable(modelsRepository.findTopByOrderByModelIdDesc()).map(Models::getModelId).orElse(0);
        return maxId + 1;
    }

    public Response saveModel(Models model) {
        Models existingModel = modelsRepository.findByModelName(model.getModelName());
        if (existingModel == null) {
            model.setModelId(generateNewModelId());
        } else {
            List<PartsDetail> existingParts = existingModel.getPartsDetails();
            existingParts.addAll(model.getPartsDetails());
            model.setPartsDetails(existingParts);
            model.setModelId(existingModel.getModelId());
        }
        modelsRepository.save(model);
        log.info("Model saved with ID: {}", model.getModelId());
        return new Response(model.getModelId(), "Model saved successfully");
    }

    public Response getListOfModels() {
        return new Response(modelsRepository.findAll().stream().map(Models::getModelName), "All models fetched successfully");
    }

    public Response getModelAndParts() {
        return new Response(modelsRepository.findAll(), "All models with parts fetched successfully");
    }


    public Response deleteModel(String modelName) {
        if (!modelsRepository.existsByModelName(modelName)) {
            throw new CustomDataException("Model does not exist");
        }
        modelsRepository.deleteByModelName(modelName);
        return new Response(modelName, "Model deleted successfully");
    }

    public Response getListOfParts(String modelName) {
        Models model = modelsRepository.findByModelName(modelName);
        if (model == null) {
            throw new CustomDataException("Model does not exist");
        }
        return new Response(model.getPartsDetails(), "Parts fetched successfully for model: " + modelName);
    }

}
