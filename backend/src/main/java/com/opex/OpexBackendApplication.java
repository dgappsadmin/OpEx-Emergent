package com.opex;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OpexBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(OpexBackendApplication.class, args);
        System.out.println("Application is running and up");
    }
}