package com.prakharSales.jobcard.service;

import com.itextpdf.html2pdf.HtmlConverter;
import com.prakharSales.jobcard.model.JobCard;
import com.prakharSales.jobcard.model.LabourCharge;
import com.prakharSales.jobcard.model.PartBill;
import com.prakharSales.jobcard.repository.JobCardRepository;
import com.prakharSales.jobcard.repository.LabourChargeRepository;
import com.prakharSales.jobcard.repository.PartBillRepository;
import com.prakharSales.jobcard.utils.DateUtils;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class JobCardService {
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private JobCardRepository jobCardRepository;
    @Autowired
    private PartBillRepository partBillRepository;
    @Autowired
    private LabourChargeRepository labourChargeRepository;
    @Autowired
    private FileService fileService;

    public void saveCustomerDetails(JobCard jobCard, List<MultipartFile> file) throws Exception {
        log.info("Saving job card details for jobCardId: {}", jobCard.getJobCardId());
        if (jobCard.getJobCardId() == null || jobCard.getJobCardId() == 0 || !jobCardRepository.existsById(jobCard.getJobCardId())) {
            jobCard.setJobCardId(generateJobCardId());
            jobCard.setDate(DateUtils.getCurrentFormattedDate());
            log.info("Creating new record with id {}", jobCard.getJobCardId());
        } else {
            log.info("Job card with jobCardId: {} already exists. Updating existing record.", jobCard.getJobCardId());
            JobCard existingJobCard = jobCardRepository.findById(jobCard.getJobCardId()).get();
            jobCard.setDate(existingJobCard.getDate());
        }
        if (file != null && !file.isEmpty()) {
            List<String> fileIds = new java.util.ArrayList<>(file.stream().map(f -> {
                try {
                    return fileService.uploadFile(f);
                } catch (Exception e) {
                    log.error("Error uploading file: {}", e.getMessage());
                    return null;
                }
            }).toList());

            if(jobCard.getFileIds()!= null && !jobCard.getFileIds().isEmpty()) {
                fileIds.addAll(jobCard.getFileIds());
            }

            jobCard.setFileIds(fileIds);
        }

        if( jobCard.getAdditionalDiscount() == null ) {
        	jobCard.setAdditionalDiscount(0);
        }

        Integer totalCost = -jobCard.getAdditionalDiscount();
        if (jobCard.getPartBillList() != null && !jobCard.getPartBillList().isEmpty()) {
            for (PartBill partBill : jobCard.getPartBillList()) {
                partBill.setJobCardId(jobCard.getJobCardId());
                partBill.setId(partBill.getPartName() + "_" + jobCard.getJobCardId());
                if(!partBill.isWarranty) totalCost += partBill.getTotal();
            }
          //  partBillRepository.saveAll(jobCard.getPartBillList());
        }

        if (jobCard.getLabourCharge() != null && !jobCard.getLabourCharge().isEmpty()) {
            for (LabourCharge labourCharge : jobCard.getLabourCharge()) {
                labourCharge.setJobCardId(jobCard.getJobCardId());
                labourCharge.setId(labourCharge.getName() + "_" + jobCard.getJobCardId());
                totalCost += labourCharge.getPrice();
            }
           // labourChargeRepository.saveAll(jobCard.getLabourCharge());
        }
        jobCard.setTotalCharge(totalCost);
        jobCardRepository.save(jobCard);
    }

    public JobCard getJobCard(Integer jobCardId) {
        if (!jobCardRepository.existsById(jobCardId)) {
            log.info("Job card with jobCardId: {} does not exist.", jobCardId);
            return null;
        }
        log.info("Retrieving job card details for jobCardId: {}", jobCardId);
        return jobCardRepository.findById(jobCardId).orElseThrow();
    }

    public List<JobCard> getAllJobCards() {
        log.info("Retrieving all job card details");
        return jobCardRepository.findAll();
    }

    public Integer generateJobCardId() {
        Integer maxId = Math.toIntExact(jobCardRepository.count());
        if (maxId == null) {
            maxId = 0;
        }
        return maxId + 1;
    }

    public void deleteJobCard(Integer id) {
        if (jobCardRepository.existsById(id)) {
            log.info("Deleting job card with jobCardId: {}", id);
            jobCardRepository.deleteById(id);
        } else {
            log.info("Job card with jobCardId: {} does not exist. No action taken.", id);
        }
    }

    public void downloadPdf(Integer jobCardId, HttpServletResponse response) throws IOException {
        log.info("Downloading PDF for jobCardId: {}", jobCardId);
        JobCard jobCard = getJobCard(jobCardId);

        // Load HTML template from resources
        InputStream inputStream = getClass().getResourceAsStream("/static/invoice.html");
        String htmlContent = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);

        htmlContent = htmlContent.replace("{{jobCardId}}", jobCard.getJobCardId().toString());
        htmlContent = htmlContent.replace("{{name}}", jobCard.getName());
        htmlContent = htmlContent.replace("{{model}}", jobCard.getModel());
        htmlContent = htmlContent.replace("{{serviceType}}", jobCard.getServiceType());
        htmlContent = htmlContent.replace("{{date}}", jobCard.getDate());
        htmlContent = htmlContent.replace("{{totalCharge}}", jobCard.getTotalCharge().toString());
        htmlContent = htmlContent.replace("{{address}}", jobCard.getAddress());
        htmlContent = htmlContent.replace("{{phoneNumber}}", jobCard.getPhoneNumber());
        htmlContent = htmlContent.replace("{{chasisNumber}}", jobCard.getChasisNumber());
        htmlContent = htmlContent.replace("{{motorNumber}}", jobCard.getMotorNumber());
        htmlContent = htmlContent.replace("{{kilometerReading}}", jobCard.getKilometerReading());
        htmlContent = htmlContent.replace("{{dateForSale}}", jobCard.getDateForSale());
        htmlContent = htmlContent.replace("{{initialObservation}}", jobCard.getInitialObservations());
        htmlContent = htmlContent.replace("{{damaged}}", String.join(",", jobCard.getDamaged()));
        htmlContent = htmlContent.replace("{{scratch}}", String.join(",", jobCard.getScratch()));
        htmlContent = htmlContent.replace("{{missing}}", String.join(",", jobCard.getMissing()));
        htmlContent = htmlContent.replace("{{saName}}", jobCard.getSaName());
        htmlContent = htmlContent.replace("{{techName}}", jobCard.getTechName());
        htmlContent = htmlContent.replace("{{fiName}}", jobCard.getFiName());
        htmlContent = htmlContent.replace("{{additionalDiscount}}", jobCard.getAdditionalDiscount().toString());
        htmlContent = htmlContent.replace("{{signatureBase64}}", jobCard.getSignatureBase64());

        StringBuilder itemsRows = new StringBuilder();
        StringBuilder labourRows = new StringBuilder();
        for (PartBill partBill : jobCard.getPartBillList()) {
            itemsRows.append("<tr>")
                    .append("<td style='padding:8px; border:1px solid #ddd;'>").append(partBill.getPartName()).append("</td>")
                    .append("<td style='text-align:right;padding:8px; border:1px solid #ddd;'>").append(partBill.getQuantity()).append("</td>")
                    .append("<td style='text-align:right;padding:8px; border:1px solid #ddd;'>").append(partBill.getPrice()).append("</td>")
                    .append("<td style='text-align:right;padding:8px; border:1px solid #ddd;'>").append(partBill.getTotal()).append("</td>")
                    .append("<td style='text-align:right;padding:8px; border:1px solid #ddd;'>").append(partBill.isWarranty()?"Yes":"No").append("</td>")
                    .append("</tr>");
        }
        for (LabourCharge labourCharge : jobCard.getLabourCharge()) {
            labourRows.append("<tr>")
                    .append("<td style='padding:8px; border:1px solid #ddd;'>").append(labourCharge.getName()).append("</td>")
                    .append("<td style='text-align:right;padding:8px; border:1px solid #ddd;'>").append(labourCharge.getPrice()).append("</td>")
                    .append("</tr>");
        }

        htmlContent = htmlContent.replace("{{partBillList}}", itemsRows.toString());
        htmlContent = htmlContent.replace("{{labourCharge}}", labourRows.toString());

        // Set response headers for file download
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

        try (OutputStream out = response.getOutputStream()) {
            HtmlConverter.convertToPdf(htmlContent, out);
        }
    }
}

