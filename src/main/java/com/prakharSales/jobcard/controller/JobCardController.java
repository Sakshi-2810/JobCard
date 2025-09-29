package com.prakharSales.jobcard.controller;

import com.prakharSales.jobcard.model.JobCard;
import com.prakharSales.jobcard.model.Response;
import com.prakharSales.jobcard.service.JobCardService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
public class JobCardController {
    @Autowired
    private JobCardService jobCardService;

    @GetMapping(value = "/all/jobcards", produces = "application/json")
    public ResponseEntity<Response> getAllJobCards() {
        List<JobCard> jobCards = jobCardService.getAllJobCards();
        return ResponseEntity.ok(new Response(jobCards, "Job cards retrieved successfully"));
    }

    @GetMapping(value = "/single", produces = "application/json")
    public ResponseEntity<Response> getJobCardById(@RequestParam(value = "id") Integer id) {
        JobCard jobCard = jobCardService.getJobCard(id);
        return ResponseEntity.ok(new Response(jobCard, "Job card retrieved successfully"));
    }

    @PostMapping(value = "/add", produces = "application/json", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Response> addJobCard(@RequestBody JobCard jobCard) throws Exception {
        jobCardService.saveCustomerDetails(jobCard);
        return ResponseEntity.ok(new Response(jobCard.getJobCardId(), "Job card : " + jobCard.getJobCardId() + " added successfully"));
    }

    @DeleteMapping(produces = "application/json", value = "/delete")
    public ResponseEntity<Response> deleteJobCard(@RequestParam(value = "id") Integer id) {
        jobCardService.deleteJobCard(id);
        return ResponseEntity.ok(new Response(id, "Job card deleted successfully"));
    }

    @GetMapping("/download-pdf")
    public ResponseEntity<?> downloadPdf(@RequestParam Integer jobCardId, HttpServletResponse response) throws IOException {
        jobCardService.downloadPdf(jobCardId, response);
        return ResponseEntity.ok().build();
    }
}
