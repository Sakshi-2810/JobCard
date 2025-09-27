package com.prakharSales.jobcard.controller;

import com.prakharSales.jobcard.model.PartsDetail;
import com.prakharSales.jobcard.model.Response;
import com.prakharSales.jobcard.service.PartDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
public class PartDetailsController {

    @Autowired
    private PartDetailsService partDetailsService;

    @GetMapping("/model/all")
    public ResponseEntity<Response> getModels() {
        Set<String> models = partDetailsService.getModels();
        return ResponseEntity.ok(new Response(models, "Models retrieved successfully"));
    }

    @GetMapping("/partlist")
    public ResponseEntity<Response> getPartList(@RequestParam String model) {
        List<PartsDetail> parts = partDetailsService.getPartList(model);
        return ResponseEntity.ok(new Response(parts, "Part list retrieved successfully"));
    }
}
