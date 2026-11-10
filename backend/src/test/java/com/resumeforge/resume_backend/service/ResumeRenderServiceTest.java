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

    @Autowired
    private com.resumeforge.resume_backend.service.ai.AiResumeService aiResumeService;

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
        try {
            java.nio.file.Files.write(java.nio.file.Path.of("target/aman-verma-spacious.pdf"), pdf);
        } catch (Exception ignored) {}
        // Standard PDF magic header: %PDF-
        assertEquals('%', (char) pdf[0]);
        assertEquals('P', (char) pdf[1]);
        assertEquals('D', (char) pdf[2]);
        assertEquals('F', (char) pdf[3]);
    }

    @Test
    void testRenderNordicToPng() throws Exception {
        List<String> templatesToVerify = List.of(
                "nordic-earnshaw",
                "split-navy",
                "austin-yellow",
                "teal-timeline",
                "foundation-purple",
                "sage-ramanathan"
        );

        for (String tId : templatesToVerify) {
            Resume resume = new Resume();
            resume.setTemplateId(tId);
            resume.setTitle("Professional Resume");
            resume.setPersonalInfo(new Resume.PersonalInfo(
                    "Alex Smith", "alex@example.com", "+1234567890",
                    "New York, NY", "linkedin.com/in/alexsmith",
                    "github.com/alexsmith", "", null, "Senior Systems Architect"
            ));
            resume.setSummary("High-performing technology strategist with deep expertise in designing resilient, large-scale distributed architectures and mentoring high-growth engineering teams.");
            resume.setSkills(List.of(
                    "User Interface (UI)", "Figma", "HTML5 & CSS3", "JavaScript",
                    "TypeScript", "React", "Storybook", "Wireframing",
                    "High-Fidelity Prototyping", "Usability Testing", "User Research",
                    "Adobe Illustrator", "Adobe Photoshop", "Micro-interactions"
            ));
            resume.setExperience(List.of(
                    new Resume.Experience("PixelCraft Solutions", "Staff Design Engineer", "2021", "Present", true,
                            List.of(
                                    "Engineered high-performance enterprise UI components reducing bundle latency by 35% across web applications.",
                                    "Orchestrated cross-functional collaboration across 14 engineers and design directors to deliver on milestones.",
                                    "Designed comprehensive design tokens and micro-interactions adhering to strict WCAG 2.1 AA accessibility guidelines."
                            ))
            ));
            resume.setProjects(List.of(
                    new Resume.Project("Enterprise Design System & Token Architecture", "React, TypeScript, Storybook", "",
                            List.of(
                                    "Architected a scalable digital design system leveraging WCAG 2.1 AA accessibility standards and token pipelines.",
                                    "Standardized 45+ UI primitives across multi-tenant cloud platforms reducing development cycle time by 40%."
                            ))
            ));

            byte[] pdf = renderService.renderPdf(resume);
            assertNotNull(pdf);
            assertTrue(pdf.length > 0);

            try (org.apache.pdfbox.pdmodel.PDDocument doc = org.apache.pdfbox.pdmodel.PDDocument.load(pdf)) {
                org.apache.pdfbox.rendering.PDFRenderer renderer = new org.apache.pdfbox.rendering.PDFRenderer(doc);
                java.awt.image.BufferedImage bim = renderer.renderImageWithDPI(0, 80);
                javax.imageio.ImageIO.write(bim, "PNG", new java.io.File("target/" + tId + "-preview.png"));
            }
        }
    }

    @Test
    void testTemplateRegistry() {
        assertEquals(17, registry.all().size());
        assertTrue(registry.exists("modern-02"));
        assertTrue(registry.exists("foundation-purple"));
        assertTrue(registry.exists("split-navy"));
        assertTrue(registry.exists("minimalist-bennett"));
        assertTrue(registry.exists("austin-yellow"));
        assertTrue(registry.exists("teal-timeline"));
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

    @Test
    void testAmanVermaResumeDynamicDensity() {
        Resume resume = new Resume();
        resume.setTemplateId("seafoam-smith");
        resume.setUserId("user-aman");
        resume.setTitle("Software Engineer");
        resume.setPersonalInfo(new Resume.PersonalInfo(
                "Aman Verma", "aman.dev@email.com", "+91 9876543210",
                "Bengaluru, India", "https://linkedin.com/in/amanverma",
                "", "", null, "Senior Full-Stack Software Engineer"
        ));
        resume.setSummary("Results-driven Senior Full-Stack Software Engineer with 5+ years of experience architecting high-concurrency web applications across FinTech and E-commerce sectors. Expert in React, Next.js, Node.js, TypeScript, and AWS cloud infrastructure, consistently delivering scalable, high-performance distributed systems with 99.99% uptime.");
        resume.setSkills(List.of("React.js", "Next.js", "TypeScript", "Node.js", "Express.js", "NestJS", "GraphQL", "PostgreSQL", "MongoDB", "Redis", "AWS", "Docker", "Kubernetes", "CI/CD", "Kafka", "Tailwind CSS"));
        resume.setCertifications(List.of("AWS Certified Solutions Architect"));
        resume.setExperience(List.of(
                new Resume.Experience("Razorpay", "Senior Software Engineer", "Jan 2024", "", true,
                        List.of(
                                "Spearheaded a cross-functional team of 5 engineers to rebuild the merchant settlement dashboard using Next.js, TypeScript, and GraphQL, reducing page load times from 3.2s to 0.8s.",
                                "Designed and deployed event-driven microservices using Node.js, Kafka, and Redis, successfully handling 50,000+ transactions per minute with 99.99% system uptime.",
                                "Mentored 4 junior engineers and established automated CI/CD pipelines using GitHub Actions and Docker, reducing overall deployment delivery time by 45%."
                        )),
                new Resume.Experience("Flipkart", "Software Development Engineer", "July 2021", "Dec 2023", false,
                        List.of(
                                "Developed high-performance, reusable UI component libraries in React and Tailwind CSS, adopted across 12 internal micro-frontends to unify design standards and accelerate delivery.",
                                "Optimized PostgreSQL database indexing and query execution plans for core order tracking services, decreasing database CPU utilization by 30% during peak sale events."
                        ))
        ));
        resume.setEducation(List.of(
                new Resume.Education("NIT Trichy", "B.Tech", "Information Technology", "2017", "2021", "")
        ));
        resume.setProjects(List.of(
                new Resume.Project("Distributed FinTech Settlement Engine", "Node.js, TypeScript, Kafka, Redis, PostgreSQL", "",
                        List.of(
                                "Engineered a fault-tolerant transaction processing simulator handling asynchronous payment events at scale with robust failover mechanisms.",
                                "Implemented Redis caching layers to reduce database read pressure by over 60% under simulated peak workloads."
                        ))
        ));

        // HTML and PDF rendering test
        String html = renderService.renderHtml(resume);
        assertNotNull(html);
        assertTrue(html.contains("Aman Verma"));
        assertTrue(html.contains("Razorpay"));

        byte[] pdf = renderService.renderPdf(resume);
        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
        try {
            java.nio.file.Files.write(java.nio.file.Path.of("target/aman-verma.pdf"), pdf);
        } catch (Exception ignored) {}
    }

    @Test
    void testEmptyDraftRenderAcrossAllTemplates() {
        Resume emptyResume = new Resume();
        emptyResume.setUserId("user-blank");
        emptyResume.setPersonalInfo(new Resume.PersonalInfo("", "", "", "", "", "", ""));
        for (TemplateRegistry.TemplateInfo t : registry.all()) {
            emptyResume.setTemplateId(t.id());
            assertDoesNotThrow(() -> {
                String html = renderService.renderHtml(emptyResume);
                assertNotNull(html, "HTML should not be null for " + t.id());
                byte[] pdf = renderService.renderPdf(emptyResume);
                assertNotNull(pdf, "PDF should not be null for " + t.id());
                assertTrue(pdf.length > 0, "PDF should have bytes for " + t.id());
            }, "Failed rendering empty draft on template: " + t.id());
        }
    }

    @Test
    void testCustomAccentColorAndFontAndDensity() {
        Resume resume = new Resume();
        resume.setTemplateId("split-navy");
        resume.setUserId("user-custom");
        resume.setTitle("Custom Styled Resume");
        resume.setPersonalInfo(new Resume.PersonalInfo("Custom Candidate", "custom@example.com", "+123456789", "Boston, MA", "", "", ""));
        resume.setAccentColor("#dc2626"); // Red
        resume.setFontFamily("georgia");
        resume.setPageDensity("compact");

        String html = renderService.renderHtml(resume);
        assertNotNull(html);
        assertTrue(html.contains("#dc2626"), "Rendered HTML should contain custom red accent color");
        assertTrue(html.contains("Georgia"), "Rendered HTML should contain custom Georgia font");
        assertTrue(html.contains(".section { margin-bottom: 6pt !important; }"), "Rendered HTML should contain compact density rules");

        byte[] pdf = renderService.renderPdf(resume);
        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }

    @Test
    void testCoverLetterGeneration() {
        var req = new com.resumeforge.resume_backend.dto.ai.CoverLetterRequest(
                "Ankit Sharma", "ankit@example.com", "+1234567890", "Bengaluru, India",
                "Full Stack Developer", "Google", "Staff Software Engineer",
                "Building high throughput cloud distributed systems",
                "Experienced architect specializing in scalable microservices.",
                List.of("Java", "Spring Boot", "Kubernetes", "GCP"),
                List.of("Architected cloud migration for 50M users", "Reduced infrastructure spend by 28%"),
                "confident"
        );

        var res = aiResumeService.generateCoverLetter(req);
        assertNotNull(res);
        assertNotNull(res.salutation());
        assertTrue(res.salutation().contains("Google"));
        assertNotNull(res.openingParagraph());
        assertNotNull(res.bodyParagraph1());
        assertNotNull(res.fullLetter());
        assertTrue(res.fullLetter().contains("Google"));
        assertTrue(res.fullLetter().contains("Ankit Sharma"));
    }
}