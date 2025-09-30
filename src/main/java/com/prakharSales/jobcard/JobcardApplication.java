package com.prakharSales.jobcard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableMongoRepositories(basePackages = "com.prakharSales.jobcard.repository")
@SpringBootApplication
@EnableScheduling
public class JobcardApplication {

    public static void main(String[] args) {
        SpringApplication.run(JobcardApplication.class, args);
    }

}
