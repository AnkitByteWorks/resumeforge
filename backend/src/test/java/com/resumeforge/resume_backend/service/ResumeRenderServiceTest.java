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
        assertEquals(22, registry.all().size());
        assertTrue(registry.exists("classic-01"));
        assertTrue(registry.exists("modern-02"));
        assertTrue(registry.exists("emerald-03"));
        assertTrue(registry.exists("slate-04"));
        assertTrue(registry.exists("violet-05"));
        assertTrue(registry.exists("crimson-06"));
        assertTrue(registry.exists("foundation-purple"));
        assertTrue(registry.exists("split-navy"));
        assertTrue(registry.exists("austin-yellow"));
        assertTrue(registry.exists("creative-watson"));
        assertTrue(registry.isTwoColumn("foundation-purple"));
        assertTrue(registry.hasPhoto("foundation-purple"));
        assertFalse(registry.exists("unknown-99"));
    }

    @Test
    void testRenderAllTemplatesHtmlAndPdf() {
        Resume resume = new Resume();
        resume.setUserId("user1");
        resume.setTitle("Full Stack Engineer");
        resume.setPersonalInfo(new Resume.PersonalInfo(
                "Jane Doe", "jane@example.com", "+1234567890",
                "San Francisco, CA", "https://linkedin.com/in/janedoe",
                "https://github.com/janedoe", "https://janedoe.dev",
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                "Senior Software Architect"
        ));
        resume.setSummary("Passionate engineer building scalable distributed cloud architectures.");
        resume.setSkills(List.of("Java", "Spring Boot", "React", "Docker", "Kubernetes", "AWS"));
        resume.setExperience(List.of(
                new Resume.Experience("Tech Innovators Inc", "Staff Software Engineer", "2021-01", "2024-01", false,
                        List.of("Architected high throughput real-time streaming pipeline", "Cut operational cloud costs by 35%"))
        ));
        resume.setEducation(List.of(
                new Resume.Education("Stanford University", "B.S. Computer Science", "Computer Science",
                        "2017-09", "2021-06", "3.95 GPA")
        ));
        resume.setProjects(List.of(
                new Resume.Project("CloudForge", "Java, Spring, Redis", "https://github.com/cloudforge",
                        List.of("Built distributed event driven message bus"))
        ));
        resume.setCertifications(List.of("AWS Certified Solutions Architect", "CKA"));

        for (TemplateRegistry.TemplateInfo t : registry.all()) {
            resume.setTemplateId(t.id());
            String html = renderService.renderHtml(resume);
            assertNotNull(html, "HTML rendering should not be null for " + t.id());
            assertTrue(html.contains("Jane Doe"), "HTML should contain name for " + t.id());

            byte[] pdf = renderService.renderPdf(resume);
            assertNotNull(pdf, "PDF should not be null for " + t.id());
            assertTrue(pdf.length > 0, "PDF should have content for " + t.id());
            assertEquals('%', (char) pdf[0]);
            assertEquals('P', (char) pdf[1]);
            assertEquals('D', (char) pdf[2]);
            assertEquals('F', (char) pdf[3]);
        }
    }
}
