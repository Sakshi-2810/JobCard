package com.prakharSales.jobcard.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Models {
    @Id
    private Integer modelId;
    @Indexed(unique = true)
    private String modelName;
    private List<PartsDetail> partsDetails = new ArrayList<>();
}
