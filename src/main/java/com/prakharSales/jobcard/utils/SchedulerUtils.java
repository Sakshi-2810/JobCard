package com.prakharSales.jobcard.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.web.exchanges.HttpExchange;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class SchedulerUtils {

    private final RestTemplate restTemplate = new RestTemplate();

    @Scheduled(cron = "0 */14 * * * *")
    public void performHealthCheck() {
        String url = "https://jobcard-l7c6.onrender.com/jobcard/index.html";
        try {
            restTemplate.getForEntity(url, String.class);
        } catch (Exception ex) {
            log.info("Error calling health API: " + ex.getMessage());
        }
    }
}
