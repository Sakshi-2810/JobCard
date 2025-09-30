package com.prakharSales.jobcard.controller;

import com.prakharSales.jobcard.model.Models;
import com.prakharSales.jobcard.model.Response;
import com.prakharSales.jobcard.service.ModelsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ModelsController {
    @Autowired
    private ModelsService modelsService;

    @GetMapping(produces = "application/json", value = "/model/all")
    public ResponseEntity<Response> getModels() {
        return ResponseEntity.ok(modelsService.getListOfModels());
    }

    @GetMapping(produces = "application/json", value = "/model/part/list")
    public ResponseEntity<Response> getPartsAndModel() {
        return ResponseEntity.ok(modelsService.getModelAndParts());
    }


    @GetMapping(value = "/partlist", produces = "application/json")
    public ResponseEntity<Response> getPartList(@RequestParam String model) {
        return ResponseEntity.ok(modelsService.getListOfParts(model));
    }

    @PostMapping(produces = "application/json", value = "/model/save")
    public ResponseEntity<Response> saveModel(@RequestBody Models model) {
        return ResponseEntity.ok(modelsService.saveModel(model));
    }

    @DeleteMapping(produces = "application/json", value = "/model/delete")
    public ResponseEntity<Response> deleteModel(@RequestParam String modelName) {
        return ResponseEntity.ok(modelsService.deleteModel(modelName));
    }
}
