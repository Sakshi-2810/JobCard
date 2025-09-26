package com.prakharSales.jobcard.controller;

import com.prakharSales.jobcard.model.JobCard;
import com.prakharSales.jobcard.model.Response;
import com.prakharSales.jobcard.service.JobCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class JobCardController {
    @Autowired
    private JobCardService jobCardService;

    @GetMapping("/all/jobcards")
    public ResponseEntity<Response> getAllJobCards() {
        List<JobCard> jobCards = jobCardService.getAllJobCards();
        return ResponseEntity.ok(new Response(jobCards, "Job cards retrieved successfully"));
    }

    @GetMapping("/single")
    public ResponseEntity<Response> getJobCardById(@RequestParam(value = "id") Integer id) {
        JobCard jobCard = jobCardService.getJobCard(id);
        return ResponseEntity.ok(new Response(jobCard, "Job card retrieved successfully"));
    }

    @PostMapping("/add")
    public ResponseEntity<Response> addJobCard(@RequestBody JobCard jobCard) {
        jobCardService.saveCustomerDetails(jobCard);
        return ResponseEntity.ok(new Response(jobCard.getJobCardId(), "Job card added successfully"));
    }

    @PutMapping("/update")
    public ResponseEntity<Response> updateJobCard(@RequestBody JobCard jobCard) {
        jobCardService.saveCustomerDetails(jobCard);
        return ResponseEntity.ok(new Response(jobCard.getJobCardId(), "Job card updated successfully"));
    }

    @GetMapping("/getId")
    public ResponseEntity<Response> generateJobCardId() {
        Integer jobCardId = jobCardService.generateJobCardId();
        return ResponseEntity.ok(new Response(jobCardId, "Job card ID generated successfully"));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Response> deleteJobCard(@RequestParam(value = "id") Integer id) {
        jobCardService.deleteJobCard(id);
        return ResponseEntity.ok(new Response(id, "Job card deleted successfully"));
    }
}
