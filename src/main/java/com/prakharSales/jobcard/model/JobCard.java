package com.prakharSales.jobcard.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Entity
@Table(name = "JobCard")
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
    private List<String> damaged;
    private List<String> scratch;
    private List<String> missing;
    private String saName;
    private String techName;
    private String fiName;
    private Boolean warranty;
    @OneToMany
    private List<PartBill> partBillList;
    @OneToMany
    private List<LabourCharge> labourCharge;
    private Integer totalCharge;
}
