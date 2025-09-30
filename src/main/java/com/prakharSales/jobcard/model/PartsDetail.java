package com.prakharSales.jobcard.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PartsDetail {
    private String partName;
    private Integer price;
    private String partCode;
}
