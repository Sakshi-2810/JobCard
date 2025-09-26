package com.prakharSales.jobcard.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "PartBill")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PartBill {
    @Id
    private String id;
    private Integer jobCardId;
    private String partName;
    private String model;
    private int quantity;
    private Integer price;
    private Integer total;
    private boolean warranty = false;
}
