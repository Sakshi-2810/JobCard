package com.prakharSales.jobcard.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Slf4j
public class Models {
    @Id
    private Integer modelId;
    @Indexed(unique = true)
    private String modelName;
    private List<PartsDetail> partsDetails = new ArrayList<>();

    public void reducePartQuantity(String partName, int quantity) {
        for (PartsDetail part : partsDetails) {
            if (part.getPartName().equalsIgnoreCase(partName) && part.getQuantity() != null) {
                int newQuantity = part.getQuantity() - quantity;
                part.setQuantity(newQuantity);
                return;
            }
        }
        log.info("Part not found: " + partName);
    }
}
