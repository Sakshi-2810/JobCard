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
            // New model → assign new ID
            model.setModelId(generateNewModelId());
        } else {
            updateParts(model, existingModel);
        }

        model.setModelName(model.getModelName().toUpperCase());
        modelsRepository.save(model);

        log.info("Model saved with ID: {}", model.getModelId());
        return new Response(model.getModelId(), "Model saved successfully");
    }

    private static void updateParts(Models newModel, Models existingModel) {
        List<PartsDetail> existingParts = existingModel.getPartsDetails();
        List<PartsDetail> newParts = newModel.getPartsDetails();

        for (PartsDetail newPart : newParts) {
            Optional<PartsDetail> existingPartOpt = existingParts.stream().filter(p -> p.getPartName().equalsIgnoreCase(newPart.getPartName())).findFirst();

            if (existingPartOpt.isPresent()) {
                PartsDetail existingPart = existingPartOpt.get();
                existingPart.setPrice(newPart.getPrice());
                existingPart.setQuantity(newPart.getQuantity());
                existingPart.setMinQuantity(newPart.getMinQuantity());
                existingPart.setLocation(newPart.getLocation());
                existingPart.setModelName(existingModel.getModelName());
                existingPart.setVendor(newPart.getVendor());
            } else {
                newPart.setModelName(existingModel.getModelName());
                existingParts.add(newPart);
            }
        }

        newModel.setPartsDetails(existingParts);
        newModel.setModelId(existingModel.getModelId());
    }


    public Response getListOfModels() {
        return new Response(modelsRepository.findAll().stream().map(Models::getModelName), "All models fetched successfully");
    }

    public Response getModelAndParts() {
        List<Models> models = modelsRepository.findAll();
        return new Response(models, "All models with parts fetched successfully");
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
        Models commonModel = modelName.equalsIgnoreCase("COMMON") ? null : modelsRepository.findByModelName("COMMON");
        if (model == null) {
            throw new CustomDataException("Model does not exist");
        }
        List<PartsDetail> partsDetails = model.getPartsDetails();
        for(PartsDetail part : partsDetails) {
            part.setModelName(modelName);
        }
        if (commonModel != null) {
            for(PartsDetail part : commonModel.getPartsDetails()) {
                part.setModelName("COMMON");
            }
            partsDetails.addAll(commonModel.getPartsDetails());
        }
        return new Response(partsDetails, "Parts fetched successfully for model: " + modelName);
    }
}
