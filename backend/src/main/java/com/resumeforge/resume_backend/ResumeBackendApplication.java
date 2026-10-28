package com.resumeforge.resume_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@EnableMongoAuditing
@SpringBootApplication
public class ResumeBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ResumeBackendApplication.class, args);
	}

}
