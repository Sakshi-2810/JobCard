package com.prakharSales.jobcard.service;

import com.prakharSales.jobcard.model.JobCard;
import com.prakharSales.jobcard.model.PartBill;
import com.prakharSales.jobcard.repository.JobCardRepository;
import com.prakharSales.jobcard.utils.DateUtils;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Slf4j
@Service
public class JobCardService {
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private JobCardRepository jobCardRepository;

    public void saveCustomerDetails(JobCard jobCard) {
        log.info("Saving job card details for jobCardId: {}", jobCard.getJobCardId());
        if (jobCard.getJobCardId() == null || jobCard.getJobCardId() == 0 || !jobCardRepository.existsById(jobCard.getJobCardId())) {
            jobCard.setJobCardId(generateJobCardId());
            jobCard.setDate(DateUtils.getCurrentFormattedDate());
            log.info("Creating new record with id {}", jobCard.getJobCardId());
        } else {
            log.info("Job card with jobCardId: {} already exists. Updating existing record.", jobCard.getJobCardId());
        }

        if (!jobCard.getDateForSale().isBlank()) {
            jobCard.setWarranty(DateUtils.isWithinOneYear(jobCard.getDateForSale(), new Date()));
        } else {
            jobCard.setWarranty(false);
        }

        Integer totalCost = 0;
        for (PartBill partBill : jobCard.getPartBillList()) {
            if (!partBill.isWarranty()) {
                totalCost += partBill.getTotal();
            }
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
        Integer maxId = jobCardRepository.findMaxJobCardId();
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
}
