package com.resumeforge.resume_backend.service.ats;

import com.resumeforge.resume_backend.dto.AtsReport;
import com.resumeforge.resume_backend.model.Resume;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AtsServiceTest {

    @Autowired
    private AtsService atsService;

    @Test
    void testAtsAnalyzeWithoutJobDescription() {
        Resume resume = new Resume();
        resume.setPersonalInfo(new Resume.PersonalInfo(
                "Jane Doe", "jane@example.com", "+1234567890",
                "San Francisco, CA", "https://linkedin.com/in/janedoe",
                "https://github.com/janedoe", null
        ));
        resume.setSummary("Dedicated and results-oriented Software Engineer with 5 years of experience in backend development.");
        resume.setSkills(List.of("Java", "Spring Boot", "Docker", "Kubernetes", "MongoDB", "SQL", "Git", "REST API"));
        resume.setExperience(List.of(
                new Resume.Experience("Tech Corp", "Backend Engineer", "2020-01", "2024-01", false,
                        List.of("Developed microservices handling 10k requests per second",
                                "Optimized database queries reducing latency by 35%",
                                "Automated CI/CD pipelines saving 5 hours weekly"))
        ));
        resume.setProjects(List.of(
                new Resume.Project("Task Manager", "Java, Spring Boot", "https://github.com/janedoe/taskmgr",
                        List.of("Built reactive REST APIs serving 2000 active users",
                                "Implemented authentication with JWT and Spring Security",
                                "Designed schema for MongoDB storing 100k tasks"))
        ));
        resume.setEducation(List.of(
                new Resume.Education("State University", "B.S. in Computer Science", "Computer Science",
                        "2016-09", "2020-05", "3.8 GPA")
        ));

        AtsReport report = atsService.analyze(resume, null);
        assertNotNull(report);
        assertFalse(report.keywordsAnalyzed());
        assertTrue(report.score() >= 70);
        assertNotNull(report.grade());
        assertEquals(3, report.categories().size());
    }

    @Test
    void testAtsAnalyzeWithJobDescription() {
        Resume resume = new Resume();
        resume.setPersonalInfo(new Resume.PersonalInfo(
                "Jane Doe", "jane@example.com", "+1234567890",
                "San Francisco, CA", "https://linkedin.com/in/janedoe",
                "https://github.com/janedoe", null
        ));
        resume.setSummary("Backend engineer skilled in Java and REST APIs.");
        resume.setSkills(List.of("Java", "Spring Boot", "MongoDB", "Git", "REST API"));
        resume.setExperience(List.of(
                new Resume.Experience("Tech Corp", "Backend Engineer", "2020-01", "2024-01", false,
                        List.of("Built microservices with Java and Spring Boot"))
        ));

        String jd = "We are hiring a Junior Java Backend Developer. You will build REST APIs using Java and Spring Boot, work with MongoDB and MySQL, write unit tests with JUnit, and deploy services using Docker on AWS. Experience with Git, Kafka and microservices is a plus.";

        AtsReport report = atsService.analyze(resume, jd);
        assertNotNull(report);
        assertTrue(report.keywordsAnalyzed());
        assertNotNull(report.keywords());
        assertTrue(report.keywords().matched().contains("Java"));
        assertTrue(report.keywords().matched().contains("Spring Boot"));
        assertTrue(report.keywords().missing().contains("MySQL"));
        assertTrue(report.keywords().missing().contains("Docker"));
    }
}
