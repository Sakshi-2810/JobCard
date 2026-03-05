package com.prakharSales.jobcard.service;

import com.prakharSales.jobcard.exception.CustomDataException;
import com.prakharSales.jobcard.model.Models;
import com.prakharSales.jobcard.model.PartsDetail;
import com.prakharSales.jobcard.model.Response;
import com.prakharSales.jobcard.repository.ModelsRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class ModelsService {
    @Autowired
    private ModelsRepository modelsRepository;

    private static void updateParts(Models newModel, Models existingModel) {
        List<PartsDetail> existingParts = existingModel.getPartsDetails();
        List<PartsDetail> newParts = newModel.getPartsDetails();

        for (PartsDetail newPart : newParts) {
            Optional<PartsDetail> existingPartOpt = existingParts.stream().filter(p -> p.getPartName().equalsIgnoreCase(newPart.getPartName())).findFirst();

            if (existingPartOpt.isPresent()) {
                PartsDetail existingPart = existingPartOpt.get();
                existingPart.setPrice(newPart.getPrice() != null && newPart.getPrice() == 0 ? existingPart.getPrice() : newPart.getPrice());
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
        for (PartsDetail part : partsDetails) {
            part.setModelName(modelName);
        }
        if (commonModel != null) {
            for (PartsDetail part : commonModel.getPartsDetails()) {
                part.setModelName("COMMON");
            }
            partsDetails.addAll(commonModel.getPartsDetails());
        }
        return new Response(partsDetails, "Parts fetched successfully for model: " + modelName);
    }

    public Response updateModel(MultipartFile file) {
        if (file.isEmpty()) {
            throw new CustomDataException("File is empty");
        }

        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
            CSVFormat csvFormat = CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim();
            CSVParser csvParser = new CSVParser(reader, csvFormat);

            Map<String, Models> modelMap = new HashMap<>();

            // Parse all records and group by model
            for (CSVRecord record : csvParser) {
                String modelName = record.get("Model");
                if (modelName.contains("model") || modelName.contains("MODELS") || modelName.contains("/") || modelName.isBlank()) {
                    modelName = "COMMON";
                }

                String partName = record.get("PART NAME");
                String partDescription = record.get("Part Description");
                String partColor = record.get("Part Color");

                // Only concatenate non-empty description
                if (partDescription != null && !partDescription.trim().isEmpty()) {
                    partName = partName.concat("-" + partDescription);
                }
                // Only concatenate non-empty color
                if (partColor != null && !partColor.trim().isEmpty()) {
                    partName = partName.concat("-" + partColor);
                }

                String location = record.get("Location");
                String vendor = record.get("Vendor");
                String totalQuantityStr = record.get("Total Quantity");
                String minimumQuantityStr = record.get("Minimum Quantity");

                // Parse numeric values
                int quantity = parseIntSafely(totalQuantityStr);
                int minQuantity = parseIntSafely(minimumQuantityStr);

                // Get or create model
                Models model = modelMap.get(modelName.toUpperCase());
                if (model == null) {
                    model = new Models();
                    model.setModelName(modelName.toUpperCase());
                    modelMap.put(modelName.toUpperCase(), model);
                }

                // Create and add parts detail
                PartsDetail partsDetail = new PartsDetail();
                partsDetail.setPartName(partName);
                partsDetail.setQuantity(quantity);
                partsDetail.setMinQuantity(minQuantity);
                partsDetail.setLocation(location);
                partsDetail.setVendor(vendor);
                partsDetail.setModelName(modelName.toUpperCase());

                model.getPartsDetails().add(partsDetail);
            }

            csvParser.close();

            // Save each model only once with all its parts
            int savedCount = 0;
            for (Models model : modelMap.values()) {
                if (!model.getPartsDetails().isEmpty()) {
                    saveModel(model);
                    savedCount++;
                    log.info("Model '{}' saved with {} parts", model.getModelName(), model.getPartsDetails().size());
                }
            }

            log.info("Successfully imported {} models from CSV file", savedCount);
            return new Response(savedCount, "Successfully imported " + savedCount + " models from CSV file");
        } catch (IOException e) {
            log.error("Error reading CSV file: ", e);
            throw new CustomDataException("Error reading CSV file: " + e.getMessage());
        }
    }

    private int parseIntSafely(String value) {
        if (value == null || value.trim().isEmpty()) {
            return 0;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            log.warn("Could not parse integer value: {}", value);
            return 0;
        }
    }

    public Response deletePartFromModel(String modelName, String partName) {
        Models model = modelsRepository.findByModelName(modelName);
        if (model == null) {
            throw new CustomDataException("Model does not exist");
        }
        List<PartsDetail> partsDetails = model.getPartsDetails();
        boolean removed = partsDetails.removeIf(part -> part.getPartName().equalsIgnoreCase(partName));
        if (!removed) {
            throw new CustomDataException("Part not found in the specified model");
        }
        log.info("Part '{}' deleted from model '{}'", partsDetails, modelName);
        model.setPartsDetails(partsDetails);
        modelsRepository.save(model);
        return new Response(partName, "Part deleted successfully from model: " + modelName);
    }
}
