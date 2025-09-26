package com.prakharSales.jobcard.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.text.SimpleDateFormat;

@Component
@Slf4j
public class DateUtils {

    public static String getCurrentFormattedDate() {
        Date now = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
        return sdf.format(now);
    }

    public static Boolean isWithinOneYear(String dateForSale, Date date) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
            Date saleDate = sdf.parse(dateForSale);
            long differenceInMillis = date.getTime() - saleDate.getTime();
            long oneYearInMillis = 365L * 24 * 60 * 60 * 1000;
            return differenceInMillis <= oneYearInMillis;
        } catch (Exception e) {
            log.error("Error parsing date: {}", e.getMessage());
            return false;
        }
    }
}
