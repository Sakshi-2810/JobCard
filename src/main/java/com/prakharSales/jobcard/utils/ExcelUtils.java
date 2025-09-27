package com.prakharSales.jobcard.utils;

import com.prakharSales.jobcard.model.PartsDetail;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Component
public class ExcelUtils {

    public static List<String> getColumnData(String sheetName, int columnIndex) {
        List<String> columnData = new ArrayList<>();
        try (InputStream is = ExcelUtils.class.getClassLoader().getResourceAsStream("JobCard.xlsx"); Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheet(sheetName);
            if (sheet == null) throw new RuntimeException("Sheet not found: " + sheetName);

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // skip header row
                Cell cell = row.getCell(columnIndex);
                String value = "";
                if (cell != null) {
                    switch (cell.getCellType()) {
                        case STRING -> value = cell.getStringCellValue();
                        case NUMERIC ->
                                value = DateUtil.isCellDateFormatted(cell) ? cell.getDateCellValue().toString() : String.valueOf(cell.getNumericCellValue());
                        case BOOLEAN -> value = String.valueOf(cell.getBooleanCellValue());
                        case FORMULA -> value = cell.getCellFormula();
                        default -> value = "";
                    }
                }
                columnData.add(value);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to read Excel file", e);
        }
        return columnData;
    }

    public static List<PartsDetail> loadParts(String sheetName) {
        List<PartsDetail> parts = new ArrayList<>();
        try (InputStream is = ExcelUtils.class.getClassLoader().getResourceAsStream("JobCard.xlsx"); Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheet(sheetName);
            if (sheet == null) throw new RuntimeException("Sheet not found: " + sheetName);

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // skip header row

                PartsDetail part = new PartsDetail();
                part.setPartName(getCellValueAsString(row.getCell(3)));
                part.setPartCode(getCellValueAsString(row.getCell(2)));
                part.setModel(getCellValueAsString(row.getCell(0)));
                part.setPrice((int) Double.parseDouble(getCellValueAsString(row.getCell(5))));
                parts.add(part);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to read Excel file", e);
        }
        return parts;
    }

    public static String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC ->
                    DateUtil.isCellDateFormatted(cell) ? cell.getDateCellValue().toString() : String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                // Evaluate the formula result type
                CellType formulaResultType = cell.getCachedFormulaResultType();
                if (formulaResultType == CellType.STRING) {
                    yield cell.getStringCellValue();
                } else if (formulaResultType == CellType.NUMERIC) {
                    if (DateUtil.isCellDateFormatted(cell)) {
                        yield cell.getDateCellValue().toString();
                    } else {
                        yield String.valueOf(cell.getNumericCellValue());
                    }
                } else if (formulaResultType == CellType.BOOLEAN) {
                    yield String.valueOf(cell.getBooleanCellValue());
                } else {
                    yield "";
                }
            }
            default -> "";
        };
    }
}
