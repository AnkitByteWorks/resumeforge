package com.resumeforge.resume_backend.service;

import com.resumeforge.resume_backend.model.Resume;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ResumeRenderServiceTest {

    @Autowired
    private ResumeRenderService renderService;

    @Autowired
    private TemplateRegistry registry;

    @Test
    void testRenderHtmlAndPdf() {
        Resume resume = new Resume();
        resume.setTemplateId("classic-01");
        resume.setUserId("user1");
        resume.setTitle("Software Engineer");
        resume.setPersonalInfo(new Resume.PersonalInfo(
                "John Doe", "john@example.com", "+1234567890",
                "New York, NY", "https://linkedin.com/in/johndoe",
                "https://github.com/johndoe", "https://johndoe.dev"
        ));
        resume.setSummary("Experienced Software Engineer");
        resume.setSkills(List.of("Java", "Spring Boot", "Docker", "MongoDB"));
        resume.setExperience(List.of(
                new Resume.Experience("Acme Corp", "Senior Engineer", "2020-01", "2024-01", false,
                        List.of("Developed microservices", "Improved performance by 40%"))
        ));
        resume.setEducation(List.of(
                new Resume.Education("Tech University", "B.S. Computer Science", "Computer Science",
                        "2016-09", "2020-05", "3.9 GPA")
        ));

        // Render HTML
        String html = renderService.renderHtml(resume);
        assertNotNull(html);
        assertTrue(html.contains("John Doe"));
        assertTrue(html.contains("Acme Corp"));

        // Render PDF
        byte[] pdf = renderService.renderPdf(resume);
        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
        // Standard PDF magic header: %PDF-
        assertEquals('%', (char) pdf[0]);
        assertEquals('P', (char) pdf[1]);
        assertEquals('D', (char) pdf[2]);
        assertEquals('F', (char) pdf[3]);
    }

    @Test
    void testTemplateRegistry() {
        assertEquals(2, registry.all().size());
        assertTrue(registry.exists("classic-01"));
        assertTrue(registry.exists("modern-02"));
        assertFalse(registry.exists("unknown-99"));
    }
}
