package com.prakharSales.jobcard.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table
public class LabourCharge {
    @Id
    private Integer id;
    private Integer jobCardId;
    private String description;
    private Integer price;
}
