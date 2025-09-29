package com.prakharSales.jobcard.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "JobCard")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobCard {
    @Id
    private Integer jobCardId;
    private String name;
    private String address;
    private String phoneNumber;
    private String chasisNumber;
    private String model;
    private String serviceType;
    private String date;
    private String motorNumber;
    private String kilometerReading;
    private String dateForSale;
    private String initialObservations;
    private List<String> damaged = new ArrayList<>();
    private List<String> scratch = new ArrayList<>();
    private List<String> missing = new ArrayList<>();
    private String saName;
    private String techName;
    private String fiName;
    private List<PartBill> partBillList = new ArrayList<>();
    private List<LabourCharge> labourCharge = new ArrayList<>();
    private Integer totalCharge;
    private Integer additionalDiscount;
    private String signatureBase64;
    private List<String> images = new ArrayList<>();
    private Integer estimatedCost = 0;
}
