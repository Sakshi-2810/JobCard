package com.prakharSales.jobcard.service;

import com.prakharSales.jobcard.model.PartsDetail;
import com.prakharSales.jobcard.utils.ExcelUtils;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class PartDetailsService {
    public Set<String> getModels() {
        return new HashSet<>(ExcelUtils.getColumnData("PartsDetail", 0).stream().map(String::toUpperCase).toList());
    }

    public List<PartsDetail> getPartList(String model) {
        return ExcelUtils.loadParts("PartsDetail").stream().filter(partsDetail -> partsDetail.getModel().equalsIgnoreCase(model)).toList();
    }
}
