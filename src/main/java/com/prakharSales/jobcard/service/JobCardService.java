package com.prakharSales.jobcard.service;

import com.prakharSales.jobcard.exception.CustomDataException;
import com.prakharSales.jobcard.model.JobCard;
import com.prakharSales.jobcard.model.LabourCharge;
import com.prakharSales.jobcard.model.PartBill;
import com.prakharSales.jobcard.repository.JobCardRepository;
import com.prakharSales.jobcard.utils.DateUtils;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class JobCardService {
    @Autowired
    private JobCardRepository jobCardRepository;
    @Autowired
    private TemplateEngine templateEngine;

    public void saveCustomerDetails(JobCard jobCard) throws Exception {
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

        if (jobCard.getAdditionalDiscount() == null) {
            jobCard.setAdditionalDiscount(0);
        }

        Integer totalCost = -jobCard.getAdditionalDiscount();
        if (jobCard.getPartBillList() != null && !jobCard.getPartBillList().isEmpty()) {
            for (PartBill partBill : jobCard.getPartBillList()) {
                if (!partBill.isWarranty()) totalCost += partBill.getTotal();
            }
        }

        if (jobCard.getLabourCharge() != null && !jobCard.getLabourCharge().isEmpty()) {
            for (LabourCharge labourCharge : jobCard.getLabourCharge()) {
                totalCost += labourCharge.getPrice();
            }
        }
        jobCard.setTotalCharge(totalCost);
        jobCardRepository.save(jobCard);
    }

    public JobCard getJobCard(Integer jobCardId) {
        if (!jobCardRepository.existsById(jobCardId)) {
            log.info("Job card with jobCardId: {} does not exist.", jobCardId);
            throw new CustomDataException("Job card with ID " + jobCardId + " does not exist.");
        }
        log.info("Retrieving job card details for jobCardId: {}", jobCardId);
        return jobCardRepository.findById(jobCardId).orElseThrow();
    }

    public List<JobCard> getAllJobCards() {
        log.info("Retrieving all job card details");
        return jobCardRepository.findAll(Sort.by(Sort.Direction.DESC, "jobCardId"));
    }

    public Integer generateJobCardId() {
        Integer maxId = Optional.ofNullable(jobCardRepository.findTopByOrderByJobCardIdDesc()).map(JobCard::getJobCardId).orElse(0);
        return maxId + 1;
    }

    public void deleteJobCard(Integer id) {
        if (jobCardRepository.existsById(id)) {
            log.info("Deleting job card with jobCardId: {}", id);
            jobCardRepository.deleteById(id);
        } else {
            log.info("Job card with jobCardId: {} does not exist. No action taken.", id);
            throw new CustomDataException("Job card with ID " + id + " does not exist.");
        }
    }

    public void downloadPdf(Integer jobCardId, HttpServletResponse response) throws IOException {
        log.info("Downloading PDF for jobCardId: {}", jobCardId);
        JobCard jobCard = getJobCard(jobCardId);

        // Prepare Thymeleaf context
        Context context = new Context();
        context.setVariable("jobCard", jobCard);

        // Include sections only if data exists
        boolean hasParts = jobCard.getPartBillList() != null && !jobCard.getPartBillList().isEmpty();
        boolean hasLabour = jobCard.getLabourCharge() != null && !jobCard.getLabourCharge().isEmpty();

        if (hasParts) {
            context.setVariable("partBillList", jobCard.getPartBillList());
        }
        if (hasLabour) {
            context.setVariable("labourCharge", jobCard.getLabourCharge());
        }

        // Generate HTML from template
        String htmlContent = templateEngine.process("invoice", context);

        // Set response headers for file download
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

        try (OutputStream os = response.getOutputStream()) {
            String xhtml = Jsoup.parse(htmlContent, "UTF-8").outputSettings(new Document.OutputSettings().syntax(Document.OutputSettings.Syntax.xml)).outerHtml();

            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(xhtml);
            renderer.layout();
            renderer.createPDF(os);
            os.flush();
            log.info("✅ PDF generated and sent for Jobcard Id ID: {}", jobCardId);
        }
    }

}

