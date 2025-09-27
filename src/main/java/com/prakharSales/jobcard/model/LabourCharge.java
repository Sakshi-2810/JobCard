package com.prakharSales.jobcard.model;

import lombok.Data;
import org.springframework.data.annotation.Id;

@Data
public class LabourCharge {
    @Id
    private String id;
    private Integer jobCardId;
    private String name;
    private Integer price;
}
