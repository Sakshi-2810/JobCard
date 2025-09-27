package com.prakharSales.jobcard.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class PartBill {
    private String partName;
    private int quantity;
    private Integer price;
    private Integer total;
    private boolean warranty = false;
}
